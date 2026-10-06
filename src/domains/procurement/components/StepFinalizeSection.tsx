'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  BoQRow,
  VendorColumnDef,
} from '@/shared/components/templates/Procurement/ComparisonPanel';
import type { PriceCell } from '@/shared/components/templates/Procurement/ComparisonPanel/ComparisonPanel';
import type { PoDraftPo } from '../types/api';
import { type PaymentMethod, type PoPreview, type PoTax } from '../types/po-finalize';
import { PaymentMethodDetailDialog } from './PaymentMethodDetailDialog';
import { PaymentMethodModal } from './PaymentMethodModal';
import type { PickWinnerRow } from './PickWinnerPanel';
import { PoCard } from './PoCard';
import { WarehousePickerModal } from './WarehousePickerModal';

interface StepFinalizeSectionProps {
  pickWinnerRows: PickWinnerRow[];
  vendorColumns: VendorColumnDef[];
  vendorData: Record<string, PriceCell[]>;
  compRows: BoQRow[];
  onValidChange?: (valid: boolean) => void;
  onPoListChange?: (poList: PoPreview[]) => void;
  isReadOnly?: boolean;
  finalizedPos?: PoDraftPo[];
}

// ── Build PO previews from pick-winner selections ──────────────────────────────
function buildPoList(
  pickRows: PickWinnerRow[],
  vendorCols: VendorColumnDef[]
): { vendorId: string; vendorName: string; itemIds: string[] }[] {
  const map: Record<string, string[]> = {};
  for (const row of pickRows) {
    for (const vc of vendorCols) {
      if (row.selections[vc.id]) {
        if (!map[vc.id]) map[vc.id] = [];
        map[vc.id].push(row.id);
      }
    }
  }
  return Object.entries(map).map(([vendorId, itemIds]) => {
    const vc = vendorCols.find((v) => v.id === vendorId);
    return { vendorId, vendorName: vc?.label ?? vendorId, itemIds };
  });
}

// ── Build PO previews from finalized API data ─────────────────────────────────
export function buildPoListFromFinalized(pos: PoDraftPo[]): PoPreview[] {
  return pos.map((po) => ({
    vendorId: po.vendor.id,
    vendorName: po.vendor.name,
    vendorAddress: po.vendor.address ?? '',
    warehouseId: po.warehouse?.id ?? po.warehouseId ?? '',
    warehouseName: po.warehouse?.name ?? '',
    warehouseAddress: po.warehouse?.address ?? '',
    dueDate: po.dueDate ?? '',
    paymentMethods: (po.paymentMethods ?? []).map((pm, idx) => ({
      id: pm.id,
      order: idx + 1,
      paymentTypeId: pm.id,
      paymentTypeCode: pm.code,
      paymentTypeLabel: pm.name,
      amount: pm.amount ?? 0,
      notes: pm.notes,
      issueDate: pm.issueDate,
      effectiveDate: pm.effectiveDate,
      bankName: pm.bankName,
      checkNumber: pm.checkNumber,
    })),
    taxes: (po.taxes ?? []).map((tax) => ({
      taxTypeId: tax.taxTypeId ?? tax.tax_type_id ?? '',
      taxTypeName: tax.name ?? '',
      rate: tax.rate ?? tax.taxRate ?? 0,
      effect: tax.effect ?? 'ADDITION',
      amount: tax.amount ?? tax.taxAmount,
    })),
    items: po.items.map((item) => ({
      id: item.draftItemId,
      name: item.catalogName,
      volPo: item.quantity,
      uom: item.uomCode,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
    })),
    costBreakdown: po.costBreakdown ?? null,
  }));
}

export function StepFinalizeSection({
  pickWinnerRows,
  vendorColumns,
  vendorData,
  compRows,
  onValidChange,
  onPoListChange,
  isReadOnly = false,
  finalizedPos,
}: StepFinalizeSectionProps) {
  // Build initial PO list from finalized data if available
  const initialPoList = useMemo(() => {
    if (finalizedPos && finalizedPos.length > 0) {
      return buildPoListFromFinalized(finalizedPos);
    }
    const poGroups = buildPoList(pickWinnerRows, vendorColumns);
    return poGroups.map((pg) => {
      return {
        vendorId: pg.vendorId,
        vendorName: pg.vendorName,
        vendorAddress: '',
        warehouseId: null,
        warehouseName: null,
        warehouseAddress: null,
        dueDate: '',
        paymentMethods: [],
        taxes: [],
        items: pg.itemIds.map((itemId) => {
          const boqIdx = compRows.findIndex((r) => r.id === itemId);
          const boqRow = compRows[boqIdx];
          const prices = vendorData[pg.vendorId]?.[boqIdx];
          return {
            id: itemId,
            name: boqRow?.material ?? itemId,
            volPo: boqRow?.volPo ?? 0,
            uom: boqRow?.uom ?? '',
            unitPrice: prices?.unitPrice ?? 0,
            totalPrice: prices?.totalPrice ?? 0,
          };
        }),
      };
    });
  }, [finalizedPos, pickWinnerRows, vendorColumns, vendorData, compRows]);

  const [poList, setPoList] = useState<PoPreview[]>(initialPoList);

  // Sync poList state when initial data changes
  useEffect(() => {
    setPoList(initialPoList);
  }, [initialPoList]);

  // ── Temporary: payment input hidden in finalize step, so save only requires dueDate + warehouseId ──
  const isValid = useMemo(() => {
    if (poList.length === 0) return false;
    if (isReadOnly) return true;
    return poList.every((po) => !!po.dueDate && !!po.warehouseId);
  }, [poList, isReadOnly]);

  useEffect(() => {
    onValidChange?.(isValid);
  }, [isValid, onValidChange]);

  useEffect(() => {
    onPoListChange?.(poList);
  }, [poList, onPoListChange]);

  // Payment modal state
  const [paymentModal, setPaymentModal] = useState<{ open: boolean; vendorId: string | null }>({
    open: false,
    vendorId: null,
  });

  // Warehouse modal state
  const [warehouseModal, setWarehouseModal] = useState<{ open: boolean; vendorId: string | null }>({
    open: false,
    vendorId: null,
  });

  // Payment detail dialog state
  const [paymentDetail, setPaymentDetail] = useState<{
    open: boolean;
    vendorId: string | null;
    paymentMethod: PaymentMethod | null;
  }>({ open: false, vendorId: null, paymentMethod: null });

  const handleOpenPayment = useCallback((vendorId: string) => {
    setPaymentModal({ open: true, vendorId });
  }, []);

  const handleViewPayment = useCallback((vendorId: string, paymentMethod: PaymentMethod) => {
    setPaymentDetail({ open: true, vendorId, paymentMethod });
  }, []);

  const handleSavePayment = useCallback(
    (methods: PaymentMethod[]) => {
      const vendorId = paymentModal.vendorId;
      if (!vendorId) return;
      setPoList((prev) =>
        prev.map((po) => (po.vendorId === vendorId ? { ...po, paymentMethods: methods } : po))
      );
    },
    [paymentModal.vendorId]
  );

  const handleOpenWarehouse = useCallback((vendorId: string) => {
    setWarehouseModal({ open: true, vendorId });
  }, []);

  const handleSaveWarehouse = useCallback(
    (warehouseId: string, warehouseName: string, warehouseAddress: string) => {
      const vendorId = warehouseModal.vendorId;
      if (!vendorId) return;
      setPoList((prev) =>
        prev.map((po) =>
          po.vendorId === vendorId ? { ...po, warehouseId, warehouseName, warehouseAddress } : po
        )
      );
    },
    [warehouseModal.vendorId]
  );

  const handleDeletePayment = useCallback((vendorId: string, paymentMethodId: string) => {
    setPoList((prev) =>
      prev.map((po) =>
        po.vendorId === vendorId
          ? {
              ...po,
              paymentMethods: po.paymentMethods.filter((pm) => pm.id !== paymentMethodId),
            }
          : po
      )
    );
  }, []);

  const handleAddTax = useCallback((vendorId: string, tax: PoTax) => {
    setPoList((prev) =>
      prev.map((po) =>
        po.vendorId === vendorId
          ? {
              ...po,
              taxes: [...po.taxes.filter((item) => item.taxTypeId !== tax.taxTypeId), tax],
              costBreakdown: null,
            }
          : po
      )
    );
  }, []);

  const handleRemoveTax = useCallback((vendorId: string, taxTypeId: string) => {
    setPoList((prev) =>
      prev.map((po) =>
        po.vendorId === vendorId
          ? {
              ...po,
              taxes: po.taxes.filter((tax) => tax.taxTypeId !== taxTypeId),
              costBreakdown: null,
            }
          : po
      )
    );
  }, []);

  const handleDueDateChange = useCallback((vendorId: string, date: string) => {
    setPoList((prev) =>
      prev.map((po) => (po.vendorId === vendorId ? { ...po, dueDate: date } : po))
    );
  }, []);

  const handleClosePaymentDetail = useCallback(() => {
    setPaymentDetail({ open: false, vendorId: null, paymentMethod: null });
  }, []);

  const activePoForPayment = poList.find((po) => po.vendorId === paymentModal.vendorId);
  const activePoForWarehouse = poList.find((po) => po.vendorId === warehouseModal.vendorId);

  // Fallback: no winners picked yet
  if (poList.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-base font-semibold text-slate-900">Finalize</h2>
        <div className="flex items-center justify-center py-16 text-sm text-slate-400">
          Belum ada pemenang dipilih. Pilih pemenang di step Pick Winner terlebih dahulu.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold text-slate-900">Finalize</h2>

      {poList.map((po) => (
        <PoCard
          key={po.vendorId}
          po={po}
          onAddPayment={handleOpenPayment}
          onEditWarehouse={handleOpenWarehouse}
          onDueDateChange={handleDueDateChange}
          onViewPayment={handleViewPayment}
          onDeletePayment={handleDeletePayment}
          onAddTax={handleAddTax}
          onRemoveTax={handleRemoveTax}
          isReadOnly={isReadOnly}
        />
      ))}

      {/* Payment Method Modal */}
      {paymentModal.vendorId && (
        <PaymentMethodModal
          open={paymentModal.open}
          onClose={() => setPaymentModal({ open: false, vendorId: null })}
          vendorName={activePoForPayment?.vendorName ?? ''}
          totalAmount={activePoForPayment?.items.reduce((s, i) => s + i.totalPrice, 0) ?? 0}
          initialMethods={
            (activePoForPayment?.paymentMethods.length ?? 0) > 0
              ? activePoForPayment?.paymentMethods
              : undefined
          }
          onSave={handleSavePayment}
        />
      )}

      {/* Warehouse Picker Modal */}
      {warehouseModal.vendorId && (
        <WarehousePickerModal
          open={warehouseModal.open}
          onClose={() => setWarehouseModal({ open: false, vendorId: null })}
          initialWarehouseId={activePoForWarehouse?.warehouseId}
          initialWarehouseName={activePoForWarehouse?.warehouseName}
          initialWarehouseAddress={activePoForWarehouse?.warehouseAddress}
          onSave={handleSaveWarehouse}
        />
      )}

      {/* Payment Method Detail Dialog */}
      {paymentDetail.open && paymentDetail.paymentMethod && (
        <PaymentMethodDetailDialog
          open={paymentDetail.open}
          onClose={handleClosePaymentDetail}
          vendorName={poList.find((p) => p.vendorId === paymentDetail.vendorId)?.vendorName ?? ''}
          paymentMethod={paymentDetail.paymentMethod}
        />
      )}
    </div>
  );
}
