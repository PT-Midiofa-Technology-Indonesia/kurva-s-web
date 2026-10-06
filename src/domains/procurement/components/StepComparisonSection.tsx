'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Plus } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  VendorOfferingDocumentFormDrawer,
  type VendorOfferingDocumentFormDrawerProps,
} from '@/domains/vendor-catalog';
import { Button } from '@/shared/components/atoms';
import {
  MultiSelectPopup,
  type MultiSelectPopupItem,
} from '@/shared/components/molecules/MultiSelectPopup';
import {
  type BoQRow,
  ComparisonPanel,
  type ComparisonPanelProps,
  type VendorColumnDef,
} from '@/shared/components/templates/Procurement/ComparisonPanel';
import type { PriceCell } from '@/shared/components/templates/Procurement/ComparisonPanel/ComparisonPanel';
import { toast } from '@/shared/lib/toast';
import { deleteVendorFromDraft } from '../api/delete-vendor';
import { type DraftVendor, getDraftVendors } from '../api/get-draft-vendors';
import { uploadOfferingDoc } from '../api/upload-offering-doc';
import { upsertQuote } from '../api/upsert-quote';
import { useCompanyId } from '../hooks/use-company-id';
import { usePoDraftDetail } from '../hooks/use-po-draft-detail-api';
import { PO_DRAFT_QUERY_KEYS } from '../hooks/use-po-draft-projects';
import type { UploadOfferingDocPayload, UpsertQuotePayload } from '../types/api';

const DRAFT_VENDORS_QUERY_KEY = 'draft-vendors';

interface StepComparisonSectionProps {
  draftId: string | null;
  onStateChange: (
    rows: BoQRow[],
    vendorCols: VendorColumnDef[],
    vendorData: Record<string, PriceCell[]>
  ) => void;
}

function mapVendorToPopupItem(vendor: DraftVendor): MultiSelectPopupItem {
  return {
    id: vendor.id,
    label: vendor.name,
    description: vendor.code,
  };
}

function getVendorUnitPrice(
  vendor: DraftVendor,
  draftItemId: string,
  catalogId: string
): number | null {
  const catalogPrice = vendor.catalogPrices.find(
    (cp) => cp.draftItemId === draftItemId && cp.catalogId === catalogId
  );
  return catalogPrice?.unitPrice ?? null;
}

export function StepComparisonSection({ draftId, onStateChange }: StepComparisonSectionProps) {
  // ── ALL hooks first (no early return before hooks) ──
  const companyId = useCompanyId();
  const { data: draft, isLoading } = usePoDraftDetail(draftId);
  const queryClient = useQueryClient();

  const [vendorCols, setVendorCols] = useState<VendorColumnDef[]>([]);
  const [vendorData, setVendorData] = useState<Record<string, PriceCell[]>>({});
  const draftVendorIdsRef = useRef(new Set<string>());

  const [vendorPopupOpen, setVendorPopupOpen] = useState(false);
  const [selectedVendorItems, setSelectedVendorItems] = useState<MultiSelectPopupItem[]>([]);

  const [uploadDrawer, setUploadDrawer] = useState<{
    open: boolean;
    vendorId: string;
    vendorName: string;
  }>({ open: false, vendorId: '', vendorName: '' });

  // Fetch vendors for this draft when modal opens
  const {
    data: vendorsData,
    isLoading: vendorsLoading,
    refetch: refetchVendors,
  } = useQuery({
    queryKey: [DRAFT_VENDORS_QUERY_KEY, draftId],
    queryFn: () => getDraftVendors(draftId!, companyId),
    enabled: !!draftId && vendorPopupOpen,
  });

  const initialRows: BoQRow[] = useMemo(() => {
    return (
      draft?.items?.map((item, idx) => ({
        id: item.id,
        no: idx + 1,
        material: item.purchaseRequestItem.catalogName || item.code,
        volPo: item.quantity,
        uom: item.purchaseRequestItem.uom.code ?? '',
        boqFinal: {
          unitPrice: item.purchaseRequestItem.boqItemCost?.unitPriceRab ?? 0,
          totalPrice: item.quantity * (item.purchaseRequestItem.boqItemCost?.unitPriceRab ?? 0),
        },
        boqCco: {
          unitPrice: item.purchaseRequestItem.boqItemCost?.unitPriceCco ?? 0,
          totalPrice: item.quantity * (item.purchaseRequestItem.boqItemCost?.unitPriceCco ?? 0),
        },
      })) ?? []
    );
  }, [draft]);

  const vendorItems = useMemo<MultiSelectPopupItem[]>(() => {
    const list = vendorsData?.data ?? [];
    const existingIds = new Set(vendorCols.map((vc) => vc.id));
    return list.filter((v) => !existingIds.has(v.id)).map(mapVendorToPopupItem);
  }, [vendorsData, vendorCols]);

  const vendorOfferingDocs = useMemo(() => {
    const map: Record<string, VendorOfferingDocumentFormDrawerProps['editItem']> = {};
    if (!draft?.items) return map;
    for (const item of draft.items) {
      for (const q of item.quotes) {
        if (q.offeringDocument && !map[q.vendor.id]) {
          map[q.vendor.id] = {
            id: q.offeringDocument.id,
            vendorId: q.vendor.id,
            title: q.offeringDocument.title,
            code: q.offeringDocument.code,
            periodStart: '',
            periodEnd: '',
            description: '',
            isActive: true,
            createdAt: '',
            updatedAt: '',
            files: q.offeringDocument.file
              ? [
                  {
                    id: q.offeringDocument.file.id,
                    fileName: q.offeringDocument.file.fileName,
                    fileSize: 0,
                    mimeType: '',
                    url: q.offeringDocument.file.url,
                  },
                ]
              : undefined,
          };
        }
      }
    }
    return map;
  }, [draft]);

  useEffect(() => {
    onStateChange(initialRows, vendorCols, vendorData);
  }, [initialRows, vendorCols, vendorData, onStateChange]);

  const upsertQuoteMut = useMutation({
    mutationFn: (payload: UpsertQuotePayload) => {
      if (!draftId) throw new Error('draftId is required');
      return upsertQuote(draftId, payload, companyId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: PO_DRAFT_QUERY_KEYS.detail(draftId!),
      });
      toast.success({ title: 'Quote berhasil disimpan' });
    },
    onError: (error) => {
      toast.error({ title: `Gagal menyimpan quote: ${error.message}` });
    },
  });

  const uploadOfferingDocMut = useMutation({
    mutationFn: (payload: UploadOfferingDocPayload) => {
      if (!draftId) throw new Error('draftId is required');
      return uploadOfferingDoc(draftId, payload, companyId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: PO_DRAFT_QUERY_KEYS.detail(draftId!),
      });
      toast.success({ title: 'Dokumen penawaran berhasil diunggah' });
      setUploadDrawer({ open: false, vendorId: '', vendorName: '' });
    },
    onError: (error) => {
      toast.error({ title: `Gagal mengunggah dokumen: ${error.message}` });
    },
  });

  const deleteVendorMut = useMutation({
    mutationFn: (vendorId: string) => {
      if (!draftId) throw new Error('draftId is required');
      return deleteVendorFromDraft(draftId, vendorId, companyId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: PO_DRAFT_QUERY_KEYS.detail(draftId!),
      });
      toast.success({ title: 'Vendor berhasil dihapus' });
    },
    onError: (error) => {
      toast.error({ title: `Gagal menghapus vendor: ${error.message}` });
    },
  });

  const handleOfferingDocSave: VendorOfferingDocumentFormDrawerProps['onSave'] = useCallback(
    (payload) => {
      const { vendorId, title, periodStart, periodEnd, description, files } = payload;
      if (!files?.[0]) return;
      uploadOfferingDocMut.mutate({
        vendorId,
        title,
        periodStart,
        periodEnd,
        notes: description,
        file: files[0],
      });
    },
    [uploadOfferingDocMut]
  );

  const handleVendorSearch = useCallback((_q: string) => {
    // client-side search not implemented for this API
  }, []);

  const handleVendorPopupSelect = useCallback(
    (items: MultiSelectPopupItem[]) => {
      if (!draft?.items) return;

      const newCols: VendorColumnDef[] = items.map((item) => ({
        id: item.id,
        label: item.label,
      }));

      setVendorCols((prev) => [...prev, ...newCols]);

      setVendorData((prev) => {
        const next = { ...prev };
        const vendorMap = new Map(vendorsData?.data?.map((v) => [v.id, v]) ?? []);

        for (const item of items) {
          if (!next[item.id]) {
            const vendor = vendorMap.get(item.id);
            const cells: PriceCell[] = draft.items.map((draftItem) => {
              const unitPrice = vendor
                ? (getVendorUnitPrice(
                    vendor,
                    draftItem.id,
                    draftItem.purchaseRequestItem.boqItemCost.catalogId ?? ''
                  ) ?? 0)
                : 0;
              const volPo = draftItem.quantity;
              return {
                unitPrice,
                totalPrice: volPo * unitPrice,
                referencePrice: 0,
              };
            });
            next[item.id] = cells;
          }
        }
        return next;
      });

      setVendorPopupOpen(false);
      setSelectedVendorItems([]);
    },
    [draft?.items, vendorsData?.data]
  );

  const handleVendorAction: ComparisonPanelProps['onVendorAction'] = (vendorId) => {
    setUploadDrawer({
      open: true,
      vendorId,
      vendorName: vendorCols.find((v) => v.id === vendorId)?.label ?? '',
    });
  };

  const handleVendorDataChange: ComparisonPanelProps['onVendorDataChange'] = (
    vendorId: string,
    newPrices: PriceCell[]
  ) => {
    if (!draft?.items) return;

    const currentVendorPrices = vendorData[vendorId] || [];

    newPrices.forEach((newPrice, itemIndex) => {
      const oldPrice = currentVendorPrices[itemIndex];

      if (newPrice.unitPrice !== oldPrice?.unitPrice) {
        const draftItem = draft.items[itemIndex];
        if (draftItem) {
          upsertQuoteMut.mutate({
            draftItemId: draftItem.id,
            vendorId,
            unitPrice: newPrice.unitPrice,
          });
        }
      }
    });

    setVendorData((prev) => ({
      ...prev,
      [vendorId]: newPrices,
    }));
  };

  const handleOpenAddVendor = useCallback(() => {
    setSelectedVendorItems([]);
    setVendorPopupOpen(true);
    refetchVendors();
  }, [refetchVendors]);

  // ── Early return AFTER all hooks ──
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button size="sm" onClick={handleOpenAddVendor}>
          <Plus className="mr-1 h-4 w-4" />
          Add Vendor
        </Button>
      </div>

      <ComparisonPanel
        rows={initialRows}
        vendorColumns={vendorCols}
        vendorData={vendorData}
        onVendorAction={handleVendorAction}
        onVendorDataChange={handleVendorDataChange}
        onRemoveVendor={(vendorId) => {
          setVendorCols((prev) => prev.filter((vc) => vc.id !== vendorId));
          setVendorData((prev) => {
            const next = { ...prev };
            delete next[vendorId];
            return next;
          });
          if (draftVendorIdsRef.current.has(vendorId)) {
            deleteVendorMut.mutate(vendorId);
            draftVendorIdsRef.current.delete(vendorId);
          }
        }}
      />

      {vendorCols.length === 0 && (
        <div className="flex items-center justify-center py-8 text-sm text-slate-400">
          Belum ada vendor. Klik &quot;Add Vendor&quot; untuk menambah kolom perbandingan.
        </div>
      )}

      <VendorOfferingDocumentFormDrawer
        open={uploadDrawer.open}
        onClose={() => setUploadDrawer({ open: false, vendorId: '', vendorName: '' })}
        vendorId={uploadDrawer.vendorId}
        vendorName={uploadDrawer.vendorName}
        editItem={vendorOfferingDocs[uploadDrawer.vendorId] ?? null}
        acceptFileTypes={draft?.offeringDocFileType ?? undefined}
        onSave={handleOfferingDocSave}
        isSaving={uploadOfferingDocMut.isPending}
      />

      <MultiSelectPopup
        open={vendorPopupOpen}
        onClose={() => setVendorPopupOpen(false)}
        onSelect={handleVendorPopupSelect}
        onToggle={setSelectedVendorItems}
        title="Tambah Vendor"
        items={vendorItems}
        selectedIds={selectedVendorItems.map((v) => v.id)}
        isLoading={vendorsLoading}
        hasMore={false}
        onLoadMore={() => {}}
        onSearch={handleVendorSearch}
        searchPlaceholder="Cari vendor..."
        emptyMessage="Tidak ada vendor ditemukan"
      />
    </>
  );
}
