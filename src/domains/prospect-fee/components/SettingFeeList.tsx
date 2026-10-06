'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { Eye, Plus, Search } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { DataTable } from '@/components/organisms/DataTable';
import { Badge } from '@/components/ui/badge';
import { PROSPECT_FEE_LABELS, STATUS_SELECT_OPTIONS } from '../constants';
import type { SettingFeeRow } from '../types';

export interface SettingFeeListProps {
  rows: SettingFeeRow[];
  isAdding?: boolean;
  onAddRow: () => void;
  onUpdateRow: (id: string, patch: Partial<SettingFeeRow>) => void;
  onView: (row: SettingFeeRow) => void;
}

const labels = PROSPECT_FEE_LABELS.SETTING_FEE_LIST;

export function SettingFeeList({
  rows,
  isAdding,
  onAddRow,
  onUpdateRow,
  onView,
}: SettingFeeListProps) {
  const [search, setSearch] = useState('');

  const filteredRows = useMemo(() => {
    if (!search) return rows;
    const q = search.toLowerCase();
    return rows.filter(
      (row) =>
        row.projectCapability.toLowerCase().includes(q) || row.companyName.toLowerCase().includes(q)
    );
  }, [rows, search]);

  const handleCellEdit = useCallback(
    (_rowIndex: number, columnId: string, value: unknown, row?: SettingFeeRow) => {
      if (!row) return;
      if (columnId === 'status') {
        onUpdateRow(row.id, { status: value === 'active' ? 'active' : 'inactive' });
        return;
      }
      onUpdateRow(row.id, { [columnId]: String(value ?? '') } as Partial<SettingFeeRow>);
    },
    [onUpdateRow]
  );

  const columns = useMemo<ColumnDef<SettingFeeRow>[]>(
    () => [
      {
        id: 'index',
        header: '',
        size: 40,
        enableSorting: false,
        enableResizing: false,
        cell: ({ row }) => <div className="flex justify-center">{row.index + 1}</div>,
      },
      {
        id: 'view',
        header: labels.COLUMNS.VIEW,
        size: 48,
        enableSorting: false,
        enableResizing: false,
        cell: ({ row }) => (
          <div className="flex justify-center">
            <button type="button" aria-label="Lihat detail" onClick={() => onView(row.original)}>
              <Eye className="h-4 w-4 text-slate-500" />
            </button>
          </div>
        ),
      },
      {
        id: 'projectCapability',
        accessorKey: 'projectCapability',
        header: labels.COLUMNS.PROJECT_CAPABILITY,
      },
      {
        id: 'companyId',
        accessorKey: 'companyId',
        header: labels.COLUMNS.COMPANY,
        cell: ({ row }) => row.original.companyName || '-',
      },
      {
        id: 'settingFee',
        header: labels.COLUMNS.SETTING_FEE,
        enableSorting: false,
        cell: ({ row }) => (row.original.ranges.length > 0 ? row.original.ranges.length : '-'),
      },
      {
        id: 'feeSetting',
        header: labels.COLUMNS.FEE_SETTING,
        enableSorting: false,
        cell: ({ row }) => (
          <Badge variant={row.original.ranges.length > 0 ? 'success' : 'destructive'}>
            {row.original.ranges.length > 0
              ? labels.FEE_SETTING_BADGE.SET
              : labels.FEE_SETTING_BADGE.UNSET}
          </Badge>
        ),
      },
      {
        id: 'status',
        accessorKey: 'status',
        header: labels.COLUMNS.STATUS,
        cell: ({ row }) => (
          <Badge variant={row.original.status === 'active' ? 'success' : 'destructive'}>
            {row.original.status === 'active'
              ? labels.STATUS_BADGE.ACTIVE
              : labels.STATUS_BADGE.INACTIVE}
          </Badge>
        ),
        meta: {
          editable: true,
          edit: { editType: 'select', selectOptions: STATUS_SELECT_OPTIONS },
        },
      },
    ],
    [onView]
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
        <Button type="button" onClick={onAddRow} disabled={isAdding}>
          <Plus className="h-4 w-4" /> {labels.ADD_BUTTON}
        </Button>
      </div>
      <DataTable<SettingFeeRow, unknown>
        columns={columns}
        data={filteredRows}
        getRowId={(row) => row.id}
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
