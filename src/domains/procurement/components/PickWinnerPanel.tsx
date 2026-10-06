'use client';

import { useCallback, useMemo } from 'react';
import { DataTable } from '@/shared/components/organisms/DataTable';
import type {
  BoQRow,
  VendorColumnDef,
} from '@/shared/components/templates/Procurement/ComparisonPanel';
import type { PriceCell } from '@/shared/components/templates/Procurement/ComparisonPanel/ComparisonPanel';
import { createPickWinnerColumns } from './pick-winner-columns';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PickWinnerRow {
  id: string;
  no: number;
  material: string;
  volPo: number;
  uom: string;
  /** vendorId → selected */
  selections: Record<string, boolean>;
}

export interface PickWinnerPanelProps {
  rows: PickWinnerRow[];
  vendorColumns: VendorColumnDef[];
  /** vendorId → PriceCell[] per row index */
  vendorData: Record<string, PriceCell[]>;
  onSelectionsChange?: (rows: PickWinnerRow[]) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PickWinnerPanel({
  rows,
  vendorColumns,
  vendorData,
  onSelectionsChange,
}: PickWinnerPanelProps) {
  const handleSelect = useCallback(
    (rowId: string, vendorId: string) => {
      const next = rows.map((r) => {
        if (r.id !== rowId) return r;
        // radio: only one vendor per row
        const newSelections: Record<string, boolean> = {};
        for (const vc of vendorColumns) {
          newSelections[vc.id] = vc.id === vendorId;
        }
        return { ...r, selections: newSelections };
      });
      onSelectionsChange?.(next);
    },
    [rows, vendorColumns, onSelectionsChange]
  );

  const columns = useMemo(
    () => createPickWinnerColumns(vendorColumns, vendorData, handleSelect),
    [vendorColumns, vendorData, handleSelect]
  );

  if (vendorColumns.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 text-sm text-slate-400">
        Belum ada vendor. Tambah vendor di step Comparison terlebih dahulu.
      </div>
    );
  }

  return (
    <DataTable
      columns={columns}
      data={rows}
      className="rounded-lg border border-slate-200 bg-white"
      enablePagination={false}
      enableColumnDnd={false}
      enableColumnResize={false}
    />
  );
}

// ─── Converter helper: BoQRow[] → PickWinnerRow[] ────────────────────────────

export function boqRowsToPickWinnerRows(
  rows: BoQRow[],
  vendorColumns: VendorColumnDef[]
): PickWinnerRow[] {
  return rows.map((r, idx) => ({
    id: r.id,
    no: idx + 1,
    material: r.material,
    volPo: r.volPo,
    uom: r.uom,
    selections: Object.fromEntries(vendorColumns.map((vc) => [vc.id, false])),
  }));
}
