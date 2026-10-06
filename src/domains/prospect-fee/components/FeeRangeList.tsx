'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { Plus, Search } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { DataTable } from '@/components/organisms/DataTable';
import { Badge } from '@/components/ui/badge';
import { FEE_RANGE_TYPE_OPTIONS, PROSPECT_FEE_LABELS, STATUS_SELECT_OPTIONS } from '../constants';
import type { FeeRange } from '../types';

export interface FeeRangeListProps {
  ranges: FeeRange[];
  isAdding?: boolean;
  onAddRange: () => void;
  onUpdateRange: (rangeId: string, patch: Partial<FeeRange>) => void;
}

const labels = PROSPECT_FEE_LABELS.SETTING_DETAIL.RANGE_LIST;
const STATUS_BADGE_LABELS = PROSPECT_FEE_LABELS.SETTING_FEE_LIST.STATUS_BADGE;

export function FeeRangeList({ ranges, isAdding, onAddRange, onUpdateRange }: FeeRangeListProps) {
  const [search, setSearch] = useState('');

  const filteredRanges = useMemo(() => {
    if (!search) return ranges;
    const q = search.toLowerCase();
    return ranges.filter((range) => String(range.min).includes(q) || String(range.max).includes(q));
  }, [ranges, search]);

  const handleCellEdit = useCallback(
    (_rowIndex: number, columnId: string, value: unknown, row?: FeeRange) => {
      if (!row) return;
      if (columnId === 'type') {
        onUpdateRange(row.id, { type: value === 'percentage' ? 'percentage' : 'nominal' });
        return;
      }
      if (columnId === 'status') {
        onUpdateRange(row.id, { status: value === 'active' ? 'active' : 'inactive' });
        return;
      }
      if (columnId === 'min' || columnId === 'max' || columnId === 'fee') {
        onUpdateRange(row.id, { [columnId]: Number(value) || 0 });
      }
    },
    [onUpdateRange]
  );

  const columns = useMemo<ColumnDef<FeeRange>[]>(
    () => [
      {
        id: 'order',
        header: labels.COLUMNS.ORDER,
        size: 60,
        enableSorting: false,
        cell: ({ row }) => row.index + 1,
      },
      {
        id: 'min',
        accessorKey: 'min',
        header: labels.COLUMNS.MIN,
        meta: { editable: true, edit: { editType: 'input', inputType: 'number' } },
      },
      {
        id: 'max',
        accessorKey: 'max',
        header: labels.COLUMNS.MAX,
        meta: { editable: true, edit: { editType: 'input', inputType: 'number' } },
      },
      {
        id: 'fee',
        accessorKey: 'fee',
        header: labels.COLUMNS.FEE,
        meta: { editable: true, edit: { editType: 'input', inputType: 'number' } },
      },
      {
        id: 'type',
        accessorKey: 'type',
        header: labels.COLUMNS.TYPE,
        cell: ({ row }) =>
          row.original.type === 'percentage'
            ? labels.TYPE_OPTIONS.PERCENTAGE
            : labels.TYPE_OPTIONS.NOMINAL,
        meta: {
          editable: true,
          edit: { editType: 'select', selectOptions: FEE_RANGE_TYPE_OPTIONS },
        },
      },
      {
        id: 'lastUpdate',
        accessorKey: 'lastUpdate',
        header: labels.COLUMNS.LAST_UPDATE,
      },
      {
        id: 'status',
        accessorKey: 'status',
        header: labels.COLUMNS.STATUS,
        cell: ({ row }) => (
          <Badge variant={row.original.status === 'active' ? 'success' : 'destructive'}>
            {row.original.status === 'active'
              ? STATUS_BADGE_LABELS.ACTIVE
              : STATUS_BADGE_LABELS.INACTIVE}
          </Badge>
        ),
        meta: {
          editable: true,
          edit: { editType: 'select', selectOptions: STATUS_SELECT_OPTIONS },
        },
      },
    ],
    []
  );

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
      <div className="flex items-center justify-between gap-3 p-4">
        <div className="relative w-[288px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={labels.SEARCH_PLACEHOLDER}
            className="pl-10"
          />
        </div>
        <Button type="button" onClick={onAddRange} disabled={isAdding}>
          <Plus className="h-4 w-4" /> {labels.ADD_BUTTON}
        </Button>
      </div>
      <DataTable<FeeRange, unknown>
        columns={columns}
        data={filteredRanges}
        getRowId={(range) => range.id}
        emptyMessage={labels.EMPTY}
        enableRangeSelection
        onCellEdit={handleCellEdit}
        enableColumnDnd={false}
        enableColumnResize={false}
        className="shadow-none rounded-none"
      />
    </div>
  );
}
