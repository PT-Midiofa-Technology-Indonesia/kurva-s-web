'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { Info, Printer, Save, Search } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useMemo, useState } from 'react';
import { Button } from '@/shared/components/atoms';
import { ItemNotFound, PageHeader } from '@/shared/components/molecules';
import { FormPageSkeleton } from '@/shared/components/templates';
import { DataTableLayout } from '@/shared/components/templates/DataTableLayout';
import { Badge } from '@/shared/components/ui/badge';
import { Label } from '@/shared/components/ui/label';
import { getFieldErrors } from '@/shared/lib/api-error';
import { formatIDR } from '@/shared/utils/currency';
import { PurchaseOrderInvoiceDrawer } from '../components/PurchaseOrderInvoiceDrawer';
import { PurchaseOrderInvoiceSection } from '../components/PurchaseOrderInvoiceSection';
import { PO_STATUS_BADGE, PROCUREMENT_LABELS } from '../constants';
import { useCancelPurchaseOrder } from '../hooks/use-cancel-purchase-order';
import { useExportPurchaseOrderPdf } from '../hooks/use-export-purchase-order-pdf';
import { useIssuePurchaseOrder } from '../hooks/use-issue-purchase-order';
import { usePurchaseOrderDetail } from '../hooks/use-purchase-order-detail';
import { useSavePurchaseOrderInvoice } from '../hooks/use-save-purchase-order-invoice';
import { useUpdatePurchaseOrder } from '../hooks/use-update-purchase-order';
import { roundTaxAmount } from '../services/tax-rounding';
import type { PoDetailItem } from '../types/purchase-order-detail';
import type { PurchaseOrderInvoiceFormValues } from '../types/purchase-order-invoice';

const ConfirmDialogDynamic = dynamic(
  () =>
    import('@/shared/components/molecules/AlertDialog').then((m) => ({
      default: m.ConfirmDialog,
    })),
  { ssr: false, loading: () => null }
);

const NON_DRAFT_STATUSES = new Set(['issued', 'completed', 'in_progress', 'cancelled']);
const PRINTABLE_STATUSES = new Set(['issued', 'in_progress', 'complete', 'completed']);
const TAX_SUMMARY_STATUSES = new Set([...NON_DRAFT_STATUSES, 'waiting_approval']);

export function PurchaseOrderDetailPage() {
  const params = useParams<{ id?: string }>();
  const purchaseOrderId = params.id ?? '';
  const router = useRouter();
  const searchParams = useSearchParams();
  const companyId = searchParams.get('companyId') ?? undefined;

  const { data: detail, isLoading, isError } = usePurchaseOrderDetail(purchaseOrderId, companyId);
  const { mutate: issueItem, isPending: isIssuing } = useIssuePurchaseOrder();
  const { mutate: cancelItem, isPending: isCancelling } = useCancelPurchaseOrder();
  const { mutate: saveItem, isPending: isSaving } = useUpdatePurchaseOrder(
    purchaseOrderId,
    companyId
  );
  const { mutate: saveInvoice, isPending: isSavingInvoice } = useSavePurchaseOrderInvoice();
  const { isExporting, handleExport } = useExportPurchaseOrderPdf();

  const [isInvoiceDrawerOpen, setIsInvoiceDrawerOpen] = useState(false);
  const [invoiceServerErrors, setInvoiceServerErrors] = useState<
    Record<string, string[]> | undefined
  >();
  const [search, setSearch] = useState('');
  const [dirtyMap, setDirtyMap] = useState<Record<string, { quantity: number; remarks: string }>>(
    {}
  );
  const [confirmTarget, setConfirmTarget] = useState<'cancel' | 'issue' | null>(null);

  const isDraft = detail?.status === 'draft';
  const isNonDraft = detail?.status ? NON_DRAFT_STATUSES.has(detail.status) : false;
  const showTaxSummary = detail?.status ? TAX_SUMMARY_STATUSES.has(detail.status) : false;
  const hasDirty = Object.keys(dirtyMap).length > 0;

  const handleBack = useCallback(() => router.back(), [router]);
  const handleIssue = useCallback(() => setConfirmTarget('issue'), []);
  const handleCancel = useCallback(() => setConfirmTarget('cancel'), []);

  const handleConfirmAction = useCallback(() => {
    if (!detail) return;
    if (confirmTarget === 'issue') {
      issueItem(
        { id: detail.id, companyId: companyId ?? '' },
        {
          onSuccess: () => setConfirmTarget(null),
        }
      );
      return;
    }

    if (confirmTarget === 'cancel') {
      cancelItem(
        { id: detail.id, companyId: companyId ?? '' },
        {
          onSuccess: () => setConfirmTarget(null),
        }
      );
    }
  }, [cancelItem, companyId, confirmTarget, detail, issueItem]);

  const handleSave = useCallback(() => {
    if (!detail || !hasDirty) return;
    const items = Object.entries(dirtyMap).map(([id, val]) => ({
      id,
      quantity: val.quantity,
      remarks: val.remarks || undefined,
    }));
    saveItem(
      { id: detail.id, companyId, payload: { items } },
      { onSuccess: () => setDirtyMap({}) }
    );
  }, [companyId, detail, dirtyMap, hasDirty, saveItem]);

  const handleSaveInvoice = useCallback(
    (values: PurchaseOrderInvoiceFormValues) => {
      if (!detail) return;
      setInvoiceServerErrors(undefined);

      const documentsPayload = (values.documents ?? [])
        .filter((doc) => Boolean(doc.documentTypeId))
        .map((doc) => ({
          documentTypeId: doc.documentTypeId,
          files: doc.files ?? [],
          existingIds: doc.existingIds ?? [],
        }));

      saveInvoice(
        {
          id: detail.id,
          companyId,
          isUpdate: detail.invoice != null,
          payload: {
            invoiceNumber: values.invoiceNumber,
            invoiceDate: values.invoiceDate,
            invoiceDueDate: values.invoiceDueDate,
            invoiceAmount: values.invoiceAmount,
            taxInvoiceNumber: values.taxInvoiceNumber || undefined,
            taxInvoiceDate: values.taxInvoiceDate || undefined,
            taxInvoiceStatus: values.taxInvoiceStatus || undefined,
            taxpayerNpwp: values.taxpayerNpwp || undefined,
            taxes: values.taxes,
            documents: documentsPayload,
          },
        },
        {
          onSuccess: () => {
            setInvoiceServerErrors(undefined);
            setIsInvoiceDrawerOpen(false);
          },
          onError: (error) => {
            const fieldErrors = getFieldErrors(error);
            if (fieldErrors) {
              setInvoiceServerErrors(fieldErrors);
            }
          },
        }
      );
    },
    [companyId, detail, saveInvoice]
  );

  const mergedItems = useMemo(() => {
    if (!detail) return [];
    return detail.items.map((item) => {
      const dirty = dirtyMap[item.id];
      if (!dirty) return item;
      return {
        ...item,
        quantity: dirty.quantity,
        remarks: dirty.remarks,
        amount: dirty.quantity * item.unitPrice,
      };
    });
  }, [detail, dirtyMap]);

  const filteredItems = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return mergedItems;
    return mergedItems.filter(
      (item) =>
        item.catalogName.toLowerCase().includes(q) || item.remarks?.toLowerCase().includes(q)
    );
  }, [mergedItems, search]);

  const handleCellEdit = useCallback(
    (rowIndex: number, columnId: string, value: unknown) => {
      if (!detail) return;
      const item = detail.items[rowIndex];
      if (!item) return;
      setDirtyMap((prev) => {
        const current = prev[item.id] ?? {
          quantity: item.quantity,
          remarks: item.remarks,
        };
        const next = { ...current };
        if (columnId === 'quantity') {
          const num = Number(value);
          next.quantity = Number.isNaN(num) ? current.quantity : num;
        } else if (columnId === 'remarks') {
          next.remarks = String(value ?? '');
        }
        if (next.quantity === item.quantity && next.remarks === item.remarks) {
          const { [item.id]: _, ...rest } = prev;
          return rest;
        }
        return { ...prev, [item.id]: next };
      });
    },
    [detail]
  );

  const statusBadge = detail
    ? (PO_STATUS_BADGE[detail.status] ??
      PO_STATUS_BADGE[detail.status?.toLowerCase()] ?? {
        label: detail.status,
        variant: 'secondary' as const,
      })
    : null;

  const labels = PROCUREMENT_LABELS.PURCHASE_ORDER_DETAIL;

  const invoiceTaxes = detail?.invoice?.taxes ?? [];
  const poBaseAmount = detail?.totalAmount ?? 0;
  const roundedInvoiceTaxAmounts = invoiceTaxes.map((tax) => roundTaxAmount(tax.taxAmount));
  const poTaxAmount = detail?.taxAmount ?? 0;
  const poGrandTotal = detail?.grandTotal ?? poBaseAmount + poTaxAmount;

  const columns = useMemo<ColumnDef<PoDetailItem>[]>(
    () => [
      {
        id: 'no',
        header: labels.TABLE.NO,
        cell: ({ row }) => row.index + 1,
        size: 50,
        enableSorting: true,
      },
      {
        accessorKey: 'catalogName',
        header: labels.TABLE.PR_SOURCE,
        enableSorting: true,
      },
      {
        accessorKey: 'quantity',
        header: labels.TABLE.VOL_PO,
        enableSorting: true,
        meta: {
          editable: isDraft,
          type: 'number',
        } as any,
        cell: ({ getValue }) => {
          const val = getValue() as number | null | undefined;
          return val != null ? val.toLocaleString('id-ID') : '-';
        },
      },
      {
        accessorKey: 'unitPrice',
        header: labels.TABLE.UNIT_PRICE,
        enableSorting: true,
        cell: ({ getValue }) => {
          const val = getValue() as number | null | undefined;
          return val != null ? formatIDR(val) : '-';
        },
      },
      {
        accessorKey: 'amount',
        header: labels.TABLE.TOTAL_PRICE,
        enableSorting: true,
        cell: ({ getValue }) => {
          const val = getValue() as number | null | undefined;
          return val != null ? formatIDR(val) : '-';
        },
      },
      {
        accessorKey: 'remarks',
        header: labels.TABLE.REMARKS,
        enableSorting: true,
        meta: {
          editable: isDraft,
        } as any,
      },
    ],
    [isDraft]
  );

  if (isLoading) {
    return <FormPageSkeleton />;
  }

  if (isError || !detail) {
    return <ItemNotFound message="Gagal memuat data Purchase Order." onBack={handleBack} />;
  }

  return (
    <>
      <div className="flex flex-col gap-6 p-6">
        <PageHeader
          title={`${labels.TITLE} — ${detail.project.name}`}
          onBack={handleBack}
          actions={
            isDraft ? (
              <div className="flex items-center gap-2">
                <Button variant="destructive" onClick={handleCancel} disabled={isCancelling}>
                  {isCancelling ? 'Cancelling...' : labels.BUTTONS.CANCEL_PO}
                </Button>
                <Button variant="default" onClick={handleIssue} disabled={isIssuing}>
                  {isIssuing ? 'Issuing...' : labels.BUTTONS.ISSUE_PO}
                </Button>
              </div>
            ) : detail.status === 'waiting_approval' ? (
              <Button variant="destructive" onClick={handleCancel} disabled={isCancelling}>
                {isCancelling ? 'Cancelling...' : labels.BUTTONS.CANCEL_PO}
              </Button>
            ) : PRINTABLE_STATUSES.has(detail.status) ? (
              <Button
                variant="outline"
                onClick={() => handleExport({ id: detail.id, companyId, code: detail.code })}
                disabled={isExporting}
              >
                <Printer className="mr-2 h-4 w-4" />
                {isExporting ? 'Mengunduh...' : labels.BUTTONS.PRINT}
              </Button>
            ) : null
          }
        />

        <div className="overflow-hidden rounded-[14px] border border-slate-200 bg-white shadow-sm">
          <div className="grid grid-cols-1 gap-6 border-b border-slate-200 px-6 py-5 md:grid-cols-2">
            <div className="flex flex-col gap-4">
              <h3 className="text-base font-semibold text-slate-950">{labels.VENDOR_INFO.TITLE}</h3>
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <Label className="text-xs font-normal text-slate-500">
                    {labels.VENDOR_INFO.NAMA_VENDOR}
                  </Label>
                  <p className="text-sm font-medium text-slate-950">{detail.vendor.name}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs font-normal text-slate-500">Kode Vendor</Label>
                  <p className="text-sm font-medium text-slate-950">{detail.vendor.code}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <h3 className="text-sm font-semibold text-slate-950">{labels.AUDIT_TRAIL.TITLE}</h3>
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <Label className="text-xs font-normal text-slate-500">
                    {labels.AUDIT_TRAIL.DIBUAT_DARI_DRAFT}
                  </Label>
                  <p className="text-sm font-medium text-slate-950">
                    {detail.sourceDraftCode ?? '-'}
                  </p>
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs font-normal text-slate-500">
                    {labels.AUDIT_TRAIL.STATUS}
                  </Label>
                  {statusBadge && (
                    <Badge variant={statusBadge.variant} className={statusBadge.className}>
                      {statusBadge.label}
                    </Badge>
                  )}
                  {detail.status === 'issued' ? (
                    <div className="flex items-start gap-2 rounded-[14px] border border-yellow-200 bg-yellow-50 px-3 py-2">
                      <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-yellow-700" />
                      <p className="text-xs font-medium text-yellow-800">
                        {labels.INFO_BANNER.ISSUED_COMPLETE_DATA}
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 py-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-950">
                {labels.TABLE.SECTION_TITLE}
              </h2>
              <div className="flex items-center gap-3">
                <div className="relative w-52">
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={labels.TABLE.SEARCH_PLACEHOLDER}
                    className="h-8 w-full rounded-md border border-slate-200 pl-3 pr-8 text-xs"
                  />
                  <Search className="absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                </div>
                {isDraft && hasDirty ? (
                  <Button variant="outline" onClick={handleSave} disabled={!hasDirty || isSaving}>
                    <Save className="h-4 w-4" />
                    {isSaving ? 'Menyimpan...' : labels.BUTTONS.SIMPAN}
                  </Button>
                ) : null}
              </div>
            </div>

            <DataTableLayout
              columns={columns}
              data={filteredItems}
              emptyMessage={labels.TABLE.EMPTY}
              enablePagination={false}
              enableRowSelection={false}
              enableColumnResize={false}
              enableColumnDnd={false}
              enableZebraStripes
              enableRangeSelection
              onCellEdit={isDraft ? handleCellEdit : undefined}
              className="rounded-none border shadow-none"
            />

            {showTaxSummary ? (
              <div className="mt-4 flex w-full">
                <div className="w-full rounded-xl bg-slate-50 p-4">
                  <p className="mb-3 text-sm font-semibold text-slate-950">
                    {labels.INVOICE_SECTION.SUMMARY.TITLE}
                  </p>
                  <div className="space-y-2 text-sm text-slate-600">
                    <div className="flex items-center justify-between gap-4">
                      <span>{labels.INVOICE_SECTION.SUMMARY.BASE_AMOUNT}</span>
                      <span className="font-medium text-slate-950">{formatIDR(poBaseAmount)}</span>
                    </div>
                    {invoiceTaxes.length > 0 ? (
                      invoiceTaxes.map((tax, idx) => {
                        const taxLabel = `${tax.taxTypeName} (${tax.rate}%)`;
                        const isDeduction = tax.effect === 'DEDUCTION';
                        return (
                          <div
                            key={tax.taxTypeId || tax.taxTypeCode}
                            className="flex items-center justify-between gap-4"
                          >
                            <span>{taxLabel}</span>
                            <span className="font-medium text-slate-950">
                              {isDeduction
                                ? `- ${formatIDR(roundedInvoiceTaxAmounts[idx])}`
                                : formatIDR(roundedInvoiceTaxAmounts[idx])}
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      <div className="flex items-center justify-between gap-4">
                        <span>{labels.INVOICE_SECTION.SUMMARY.TAX}</span>
                        <span className="font-medium text-slate-950">{formatIDR(poTaxAmount)}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between gap-4 border-t border-slate-200 pt-2 text-slate-950">
                      <span>{labels.INVOICE_SECTION.SUMMARY.TOTAL}</span>
                      <span className="font-semibold">{formatIDR(poGrandTotal)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
      {isNonDraft ? (
        <PurchaseOrderInvoiceSection
          detail={detail}
          canEdit={detail.status === 'issued' || detail.status === 'in_progress'}
          onEdit={() => {
            setInvoiceServerErrors(undefined);
            setIsInvoiceDrawerOpen(true);
          }}
        />
      ) : null}

      <PurchaseOrderInvoiceDrawer
        open={isInvoiceDrawerOpen}
        onClose={() => {
          setInvoiceServerErrors(undefined);
          setIsInvoiceDrawerOpen(false);
        }}
        detail={detail}
        isSaving={isSavingInvoice}
        serverErrors={invoiceServerErrors}
        onSubmit={handleSaveInvoice}
      />

      <Suspense fallback={null}>
        {confirmTarget === 'issue' ? (
          <ConfirmDialogDynamic
            open
            onOpenChange={() => setConfirmTarget(null)}
            variant="default"
            title={PROCUREMENT_LABELS.DIALOG.ISSUE_PO_TITLE}
            description={PROCUREMENT_LABELS.DIALOG.ISSUE_PO_DESCRIPTION}
            cancelText="Batal"
            confirmText="Ya, Issue"
            onCancel={() => setConfirmTarget(null)}
            onConfirm={handleConfirmAction}
            isLoading={isIssuing}
          />
        ) : null}
        {confirmTarget === 'cancel' ? (
          <ConfirmDialogDynamic
            open
            onOpenChange={() => setConfirmTarget(null)}
            variant="danger"
            title={PROCUREMENT_LABELS.DIALOG.CANCEL_PO_TITLE}
            description={PROCUREMENT_LABELS.DIALOG.CANCEL_PO_DESCRIPTION}
            cancelText="Batal"
            confirmText="Ya, Cancel"
            onCancel={() => setConfirmTarget(null)}
            onConfirm={handleConfirmAction}
            isLoading={isCancelling}
          />
        ) : null}
      </Suspense>
    </>
  );
}
