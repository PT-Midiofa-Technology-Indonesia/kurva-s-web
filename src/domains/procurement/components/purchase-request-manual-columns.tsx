'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { Info, Lock } from 'lucide-react';
import { Checkbox } from '@/components/atoms/Checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { PurchaseRequestCostRow } from '../types/purchase-request-cost-rows';

export interface PurchaseRequestManualColumnLabels {
  code: string;
  name: string;
  volumeRab: string;
  cco: string;
  volumeAct: string;
  existingPr: string;
  max: string;
  vol: string;
  volEditHint?: string;
  uom: string;
  remarks: string;
}

export const DEFAULT_MANUAL_COLUMN_LABELS: PurchaseRequestManualColumnLabels = {
  code: 'Kode',
  name: 'Nama',
  volumeRab: 'VOL RAB',
  cco: 'CCO',
  volumeAct: 'VOL ACT',
  existingPr: 'Existing PR',
  max: 'Max',
  vol: 'VOL',
  uom: 'UoM',
  remarks: 'Remarks',
};

export interface CreatePurchaseRequestManualColumnsOptions {
  rows: PurchaseRequestCostRow[];
  checkedIds: Record<string, boolean>;
  onToggleRow: (rowId: string, checked: boolean) => void;
  onToggleSection: (checked: boolean) => void;
  labels?: Partial<PurchaseRequestManualColumnLabels>;
}

export function createPurchaseRequestManualColumns({
  rows,
  checkedIds,
  onToggleRow,
  onToggleSection,
  labels,
}: CreatePurchaseRequestManualColumnsOptions): ColumnDef<PurchaseRequestCostRow>[] {
  const l = { ...DEFAULT_MANUAL_COLUMN_LABELS, ...labels };
  const selectableRows = rows.filter((r) => !r.disabled);
  const selectedCount = selectableRows.filter((r) => checkedIds[r.id]).length;
  const allSelected = selectableRows.length > 0 && selectedCount === selectableRows.length;
  const someSelected = selectedCount > 0 && !allSelected;

  return [
    {
      id: 'select',
      header: () => (
        <Checkbox
          checked={allSelected || (someSelected && 'indeterminate')}
          onCheckedChange={(checked) => onToggleSection(!!checked)}
          aria-label="Pilih semua"
        />
      ),
      cell: ({ row }) => {
        const r = row.original;
        const checkbox = (
          <Checkbox
            checked={!!checkedIds[r.id]}
            disabled={r.disabled}
            onCheckedChange={(checked) => onToggleRow(r.id, !!checked)}
            aria-label={`Pilih ${r.name}`}
          />
        );
        if (!r.disabled) return checkbox;
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="inline-flex border rounded-md">{checkbox}</div>
              </TooltipTrigger>
              <TooltipContent>{r.disabledReason}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
      size: 40,
      enableSorting: false,
    },
    { accessorKey: 'code', header: l.code, size: 80 },
    { accessorKey: 'name', header: l.name, size: 200 },
    { accessorKey: 'volumeRab', header: l.volumeRab, size: 80, enableSorting: false },
    { accessorKey: 'cco', header: l.cco, size: 70, enableSorting: false },
    { accessorKey: 'volumeAct', header: l.volumeAct, size: 80, enableSorting: false },
    { accessorKey: 'existingPr', header: l.existingPr, size: 90, enableSorting: false },
    { accessorKey: 'max', header: l.max, size: 70, enableSorting: false },
    {
      accessorKey: 'vol',
      header: l.vol,
      cell: ({ row }) => {
        const r = row.original;
        const remaining = r.remainingQty;

        return (
          <span className="inline-flex items-center gap-1">
            <span>{r.vol}</span>
            {!checkedIds[r.id] && l.volEditHint ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Lock className="h-3.5 w-3.5 text-slate-400" />
                  </TooltipTrigger>
                  <TooltipContent>{l.volEditHint}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : null}
            {r.vol > 0 && r.vol > remaining && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3.5 w-3.5 text-amber-500" />
                  </TooltipTrigger>
                  <TooltipContent>Melebihi sisa kuantitas (tersisa {remaining})</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </span>
        );
      },
      meta: {
        editable: true,
        editableWhen: (row) => !!checkedIds[row.id],
        edit: { editType: 'input' as const },
        cellClassName: 'h-9',
      },
      size: 100,
    },
    { accessorKey: 'uom', header: l.uom, size: 60, enableSorting: false },
    {
      accessorKey: 'remarks',
      header: l.remarks,
      meta: { editable: true, edit: { editType: 'input' as const }, cellClassName: 'h-9' },
      size: 160,
      enableSorting: false,
    },
  ];
}
