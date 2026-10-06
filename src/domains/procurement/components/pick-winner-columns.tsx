// src/domains/procurement/components/pick-winner-columns.tsx
'use client';

import type { ColumnDef } from '@tanstack/react-table';
import type { VendorColumnDef } from '@/shared/components/templates/Procurement/ComparisonPanel';
import type { PriceCell } from '@/shared/components/templates/Procurement/ComparisonPanel/ComparisonPanel';
import { cn } from '@/shared/lib/utils';
import { PROCUREMENT_LABELS } from '../constants';
import type { PickWinnerRow } from './PickWinnerPanel';

const labels = PROCUREMENT_LABELS.PO_DRAFT.PICK_WINNER.COLUMNS;

function formatNum(v: number) {
  return v.toLocaleString('id-ID');
}

function getWinner(row: PickWinnerRow, vendorColumns: VendorColumnDef[]): string {
  const selected = vendorColumns.find((vc) => row.selections[vc.id]);
  return selected?.label ?? '—';
}

export function createPickWinnerColumns(
  vendorColumns: VendorColumnDef[],
  vendorData: Record<string, PriceCell[]>,
  onSelectRow: (rowId: string, vendorId: string) => void
): ColumnDef<PickWinnerRow>[] {
  const baseCols: ColumnDef<PickWinnerRow>[] = [
    {
      accessorKey: 'no',
      header: labels.NO,
      size: 40,
      cell: ({ row }) => <span className="text-slate-600">{row.original.no}</span>,
    },
    {
      accessorKey: 'material',
      header: labels.MATERIAL_TOOLS,
      size: 160,
      cell: ({ row }) => <span className="text-slate-800">{row.original.material}</span>,
    },
    {
      accessorKey: 'volPo',
      header: labels.VOL_PO,
      size: 80,
      cell: ({ row }) => <span className="text-slate-700">{row.original.volPo}</span>,
    },
    {
      accessorKey: 'uom',
      header: labels.UOM,
      size: 64,
      cell: ({ row }) => <span className="text-slate-700">{row.original.uom}</span>,
    },
  ];

  const vendorCols: ColumnDef<PickWinnerRow>[] = [];

  for (const vc of vendorColumns) {
    vendorCols.push({
      id: `${vc.id}-select`,
      header: vc.label,
      size: 64,
      cell: ({ row }) => {
        const isSelected = !!row.original.selections[vc.id];
        return (
          <button
            type="button"
            onClick={() => onSelectRow(row.original.id, vc.id)}
            className="inline-flex items-center justify-center"
            aria-label={`Pilih ${vc.label} untuk ${row.original.material}`}
          >
            <span
              className={cn(
                'h-4 w-4 rounded-full border-2 flex items-center justify-center transition-colors',
                isSelected ? 'border-brand-600 bg-brand-600' : 'border-slate-300 bg-white'
              )}
            >
              {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
            </span>
          </button>
        );
      },
    });

    vendorCols.push({
      id: `${vc.id}-price`,
      header: `${vc.label}${labels.PRICE_SUFFIX}`,
      size: 112,
      cell: ({ row }) => {
        const rowIndex = row.index;
        const price = vendorData[vc.id]?.[rowIndex]?.totalPrice ?? 0;
        return <span className="text-right text-slate-700 tabular-nums">{formatNum(price)}</span>;
      },
    });
  }

  baseCols.push(...vendorCols, {
    id: 'winner',
    header: labels.WINNER,
    size: 112,
    cell: ({ row }) => {
      const winner = getWinner(row.original, vendorColumns);
      return winner !== '—' ? (
        <span className="text-brand-600 font-semibold">{winner}</span>
      ) : (
        <span className="text-slate-400">—</span>
      );
    },
  });

  return baseCols;
}
