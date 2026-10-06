'use client';

import type { ColumnDef, Row } from '@tanstack/react-table';
import { Copy, Loader2 } from 'lucide-react';
import { useCallback, useMemo } from 'react';
import { DataTable } from '@/components/organisms/DataTable';
import { ContextMenuItem } from '@/components/ui/context-menu';
import { Input } from '@/shared/components/atoms';
import { Checkbox } from '@/shared/components/atoms/Checkbox';
import { toast } from '@/shared/lib/toast';
import { PROCUREMENT_LABELS } from '../constants';
import type { ApprovedPrItem } from '../types/api';

interface StepPilihItemsSectionProps {
  items: ApprovedPrItem[];
  itemsLoading: boolean;
  selectedItemIds: string[];
  invalidQtyItemIds: string[];
  onToggleItem: (id: string) => void;
  itemQtyMap: Record<string, number>;
  onSetItemQty: (itemId: string, qty: number) => void;
  search: string;
  onSearchChange: (q: string) => void;
}

export function StepPilihItemsSection({
  items,
  itemsLoading,
  selectedItemIds,
  invalidQtyItemIds,
  onToggleItem,
  itemQtyMap,
  onSetItemQty,
  search,
  onSearchChange,
}: StepPilihItemsSectionProps) {
  const labels = PROCUREMENT_LABELS.PO_DRAFT.SELECT_ITEMS;
  const allSelected = items.length > 0 && selectedItemIds.length === items.length;

  const toggleAll = useCallback(() => {
    if (allSelected) {
      items.forEach((item) => {
        if (selectedItemIds.includes(item.id)) onToggleItem(item.id);
      });
    } else {
      items.forEach((item) => {
        if (!selectedItemIds.includes(item.id)) onToggleItem(item.id);
      });
    }
  }, [items, selectedItemIds, allSelected, onToggleItem]);

  // ── Cell edit: paste support via Excel mode ──
  const handleCellEdit = useCallback(
    (rowIndex: number, columnId: string, value: unknown) => {
      if (columnId !== 'volPo') return;
      const item = items[rowIndex];
      if (!item) return;

      // Only allow edit for selected rows
      if (!selectedItemIds.includes(item.id)) {
        toast.warning({ title: labels.SELECT_ITEM_FIRST });
        return;
      }

      const numValue = Number(value);
      if (Number.isNaN(numValue) || numValue < 0) return;
      onSetItemQty(item.id, Math.min(numValue, item.remainingQuantity));
    },
    [items, selectedItemIds, onSetItemQty, labels]
  );

  // ── Context menu: copy/paste ──
  const handleContextMenu = useCallback(
    (_row: Row<ApprovedPrItem>, options?: { triggerCopy?: () => void }) => {
      return (
        <ContextMenuItem onClick={() => options?.triggerCopy?.()}>
          <Copy className="h-4 w-4" />
          Salin
        </ContextMenuItem>
      );
    },
    []
  );

  const columns: ColumnDef<ApprovedPrItem>[] = useMemo(
    () => [
      {
        id: 'select',
        header: () => <Checkbox checked={allSelected} onCheckedChange={toggleAll} />,
        cell: ({ row }) => (
          <Checkbox
            checked={selectedItemIds.includes(row.original.id)}
            onCheckedChange={() => onToggleItem(row.original.id)}
          />
        ),
        size: 48,
      },
      {
        accessorKey: 'purchaseRequestCode',
        header: labels.COLUMNS.KODE,
        cell: ({ row }) => (
          <span className="text-sm text-slate-700">{row.original.purchaseRequestCode}</span>
        ),
      },
      {
        accessorKey: 'catalogName',
        header: labels.COLUMNS.NAMA_MATERIAL_TOOLS,
        cell: ({ row }) => (
          <span className="text-sm font-medium text-slate-900">
            {row.original.catalogName || row.original.description || '-'}
          </span>
        ),
      },
      {
        accessorKey: 'quantity',
        header: labels.COLUMNS.VOL_PR,
        cell: ({ row }) => <span className="text-sm text-slate-700">{row.original.quantity}</span>,
      },
      {
        id: 'volPo',
        header: labels.COLUMNS.VOL_PO,
        cell: ({ row }) => {
          const item = row.original;
          const qty = itemQtyMap[item.id];
          return <span className="text-sm text-slate-900 tabular-nums">{qty ?? ''}</span>;
        },
        meta: {
          editable: true,
          cellClassName: (row) =>
            invalidQtyItemIds.includes(row.id) ? 'border border-red-500 bg-red-50' : undefined,
        },
      },
      {
        accessorKey: 'uom',
        header: labels.COLUMNS.UOM,
        cell: ({ row }) => <span className="text-sm text-slate-600">{row.original.uom.code}</span>,
      },
      {
        accessorKey: 'remarks',
        header: labels.COLUMNS.REMARKS,
        cell: ({ row }) => (
          <span className="text-sm text-slate-500">{row.original.remarks ?? '-'}</span>
        ),
      },
    ],
    [selectedItemIds, invalidQtyItemIds, itemQtyMap, allSelected, toggleAll, onToggleItem, labels]
  );

  return (
    <div className="space-y-4">
      <div className="w-72">
        <Input
          placeholder={labels.SEARCH_PLACEHOLDER}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {itemsLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={items}
          className="shadow-none rounded-lg border border-slate-200"
          enableRangeSelection
          enablePagination={false}
          onCellEdit={handleCellEdit}
          contextMenu={handleContextMenu}
        />
      )}
    </div>
  );
}
