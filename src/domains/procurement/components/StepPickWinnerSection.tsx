'use client';

import { useCallback, useEffect, useState } from 'react';
import type {
  BoQRow,
  VendorColumnDef,
} from '@/shared/components/templates/Procurement/ComparisonPanel';
import type { PriceCell } from '@/shared/components/templates/Procurement/ComparisonPanel/ComparisonPanel';
import { boqRowsToPickWinnerRows, PickWinnerPanel, type PickWinnerRow } from './PickWinnerPanel';

interface StepPickWinnerSectionProps {
  rows: BoQRow[];
  vendorColumns: VendorColumnDef[];
  vendorData: Record<string, PriceCell[]>;
  onSelectionsChange?: (rows: PickWinnerRow[]) => void;
}

function selectCheapest(
  pickRows: PickWinnerRow[],
  rows: BoQRow[],
  vendorColumns: VendorColumnDef[],
  vendorData: Record<string, PriceCell[]>
): PickWinnerRow[] {
  if (vendorColumns.length === 0) return pickRows;

  return pickRows.map((row) => {
    const rowIdx = rows.findIndex((r) => r.id === row.id);
    if (rowIdx === -1) return row;

    let cheapestVendorId: string | null = null;
    let cheapestPrice = Infinity;

    for (const vc of vendorColumns) {
      const price = vendorData[vc.id]?.[rowIdx]?.totalPrice ?? 0;
      if (price > 0 && price < cheapestPrice) {
        cheapestPrice = price;
        cheapestVendorId = vc.id;
      }
    }

    const newSelections: Record<string, boolean> = {};
    for (const vc of vendorColumns) {
      newSelections[vc.id] = vc.id === cheapestVendorId;
    }

    return { ...row, selections: newSelections };
  });
}

export function StepPickWinnerSection({
  rows,
  vendorColumns,
  vendorData,
  onSelectionsChange,
}: StepPickWinnerSectionProps) {
  const [pickRows, setPickRows] = useState<PickWinnerRow[]>(() =>
    boqRowsToPickWinnerRows(rows, vendorColumns)
  );

  // Re-init + auto-select cheapest when rows/vendors/vendorData change
  useEffect(() => {
    const base = boqRowsToPickWinnerRows(rows, vendorColumns);
    const updated = selectCheapest(base, rows, vendorColumns, vendorData);
    setPickRows(updated);
    onSelectionsChange?.(updated);
  }, [rows, vendorColumns, vendorData, onSelectionsChange]);

  const handleSelectionsChange = useCallback(
    (updated: PickWinnerRow[]) => {
      setPickRows(updated);
      onSelectionsChange?.(updated);
    },
    [onSelectionsChange]
  );

  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold text-slate-900">Pick Winner</h2>

      <PickWinnerPanel
        rows={pickRows}
        vendorColumns={vendorColumns}
        vendorData={vendorData}
        onSelectionsChange={handleSelectionsChange}
      />
    </div>
  );
}
