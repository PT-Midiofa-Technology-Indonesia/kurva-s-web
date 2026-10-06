'use client';

import type { ColumnDef } from '@tanstack/react-table';
import {
  ArrowDownToLine,
  ArrowUpToLine,
  ChevronDown,
  Clipboard,
  Copy,
  Eye,
  Plus,
  Scissors,
  Search,
  Trash2,
} from 'lucide-react';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { DataTable } from '@/components/organisms/DataTable';
import { Badge } from '@/components/ui/badge';
import { ContextMenuItem, ContextMenuSeparator } from '@/components/ui/context-menu';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { generateId } from '@/shared/utils/generate-id';
import type { BOQTemplateListLabels } from '../types/boq-labels.types';

const DEFAULT_TEMPLATE_LIST_LABELS: BOQTemplateListLabels = {
  header: {
    title: 'Daftar Template',
    searchPlaceholder: 'Pencarian',
    tambahButton: 'Tambah',
  },
  columns: {
    view: 'View',
    name: 'Nama Template',
    projectCapability: 'Project Capability',
    status: 'Status',
  },
  statusFilters: {
    all: 'Semua Status',
    active: 'Aktif',
    inactive: 'Tidak Aktif',
  },
  statusBadges: {
    active: 'Aktif',
    inactive: 'Tidak Aktif',
  },
};

export interface BOQTemplateRow {
  id: string;
  name: string;
  projectCapability: string;
  projectCapabilityId?: string;
  status: 'active' | 'inactive';
}

export type SortField = 'name' | 'projectCapability' | 'status';

export interface BOQTemplateListProps {
  value: BOQTemplateRow[];
  onChange: (next: BOQTemplateRow[]) => void;
  projectCapabilityOptions?: { label: string; value: string }[];
  title?: string;
  searchPlaceholder?: string;
  onView?: (row: BOQTemplateRow) => void;
  initialPage?: number;
  initialPageSize?: number;
  totalItems?: number;
  totalPages?: number;
  onPaginationChange?: (page: number, perPage: number) => void;
  labels?: BOQTemplateListLabels;
}

export function BOQTemplateList({
  value,
  onChange,
  projectCapabilityOptions = [],
  title: titleProp,
  searchPlaceholder: searchPlaceholderProp,
  onView,
  initialPage = 1,
  initialPageSize = 10,
  totalItems,
  totalPages,
  onPaginationChange,
  labels: labelsProp,
}: BOQTemplateListProps) {
  const labels = useMemo(() => ({ ...DEFAULT_TEMPLATE_LIST_LABELS, ...labelsProp }), [labelsProp]);
  const title = titleProp ?? labels.header?.title ?? 'Daftar Template';
  const searchPlaceholder =
    searchPlaceholderProp ?? labels.header?.searchPlaceholder ?? 'Pencarian';
  const clipboardRef = useRef<BOQTemplateRow | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const filteredData = useMemo(() => {
    let data = value;
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(
        (row) =>
          row.name.toLowerCase().includes(q) || row.projectCapability.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') {
      data = data.filter((row) => row.status === statusFilter);
    }
    return data;
  }, [value, search, statusFilter]);

  const handleAddRow = useCallback(() => {
    const newRow: BOQTemplateRow = {
      id: generateId(),
      name: '',
      projectCapability: '',
      status: 'inactive',
    };
    onChange([...value, newRow]);
  }, [value, onChange]);

  const handleInsertAbove = useCallback(
    (target: BOQTemplateRow) => {
      const idx = value.findIndex((r) => r.id === target.id);
      const newRow: BOQTemplateRow = {
        id: generateId(),
        name: '',
        projectCapability: '',
        status: 'inactive',
      };
      const next = [...value];
      next.splice(idx, 0, newRow);
      onChange(next);
    },
    [value, onChange]
  );

  const handleInsertBelow = useCallback(
    (target: BOQTemplateRow) => {
      const idx = value.findIndex((r) => r.id === target.id);
      const newRow: BOQTemplateRow = {
        id: generateId(),
        name: '',
        projectCapability: '',
        status: 'inactive',
      };
      const next = [...value];
      next.splice(idx + 1, 0, newRow);
      onChange(next);
    },
    [value, onChange]
  );

  const handleDelete = useCallback(
    (target: BOQTemplateRow) => {
      onChange(value.filter((r) => r.id !== target.id));
    },
    [value, onChange]
  );

  const handleCut = useCallback((row: BOQTemplateRow) => {
    clipboardRef.current = row;
  }, []);

  const handleCopy = useCallback((row: BOQTemplateRow) => {
    clipboardRef.current = { ...row, id: generateId() };
  }, []);

  const handlePaste = useCallback(
    (target: BOQTemplateRow) => {
      const buf = clipboardRef.current;
      if (!buf) return;
      const idx = value.findIndex((r) => r.id === target.id);
      const next = [...value];
      next.splice(idx + 1, 0, { ...buf, id: generateId() });
      onChange(next);
      clipboardRef.current = null;
    },
    [value, onChange]
  );

  const handleCellEdit = useCallback(
    (_rowIndex: number, columnId: string, val: unknown, row?: BOQTemplateRow) => {
      if (!row) return;
      const updated = value.map((r) =>
        r.id === row.id ? { ...r, [columnId]: String(val ?? '') } : r
      );
      onChange(updated);
    },
    [value, onChange]
  );

  const columns = useMemo<ColumnDef<BOQTemplateRow>[]>(
    () => [
      {
        id: 'index',
        header: '',
        size: 32,
        enableSorting: false,
        enableResizing: false,
        cell: ({ row }) => <div className="flex justify-center">{row.index + 1}</div>,
      },
      {
        id: 'view',
        header: labels.columns?.view ?? 'View',
        size: 32,
        enableSorting: false,
        enableResizing: false,
        cell: ({ row }) => (
          <div className="flex justify-center">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    aria-label="Lihat detail"
                    onClick={() => onView?.(row.original)}
                  >
                    <Eye className="h-4 w-4 text-slate-500" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Lihat detail</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        ),
      },
      {
        accessorKey: 'name',
        header: labels.columns?.name ?? 'Nama Template',
        meta: { editable: true },
      },
      {
        id: 'projectCapability',
        accessorKey: 'projectCapability',
        header: labels.columns?.projectCapability ?? 'Project Capability',
        meta: {
          editable: true,
          edit: {
            editType: 'combobox',
            comboboxOptions: projectCapabilityOptions.map((o) => o.label),
          },
        },
      },
      {
        accessorKey: 'status',
        header: labels.columns?.status ?? 'Status',
        size: 120,
        cell: ({ row }) => {
          const isActive = row.original.status === 'active';
          return (
            <Badge variant={isActive ? 'success' : 'destructive'}>
              {isActive
                ? (labels.statusBadges?.active ?? 'Aktif')
                : (labels.statusBadges?.inactive ?? 'Tidak Aktif')}
            </Badge>
          );
        },
        meta: {
          editable: true,
          edit: {
            editType: 'select',
            selectOptions: [
              { value: 'active', label: labels.statusBadges?.active ?? 'Aktif' },
              { value: 'inactive', label: labels.statusBadges?.inactive ?? 'Tidak Aktif' },
            ],
          },
        },
      },
    ],
    [onView, projectCapabilityOptions, labels]
  );

  const statusFilterLabel =
    statusFilter === 'all'
      ? (labels.statusFilters?.all ?? 'Semua Status')
      : statusFilter === 'active'
        ? (labels.statusFilters?.active ?? 'Aktif')
        : (labels.statusFilters?.inactive ?? 'Tidak Aktif');

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-6 border-b border-slate-200">
        <h2 className="text-lg font-semibold">{title}</h2>
        <div className="flex items-center gap-4">
          <div className="relative w-[288px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-10"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="justify-between gap-1 w-[186px]"
              >
                <span>{statusFilterLabel}</span>
                <ChevronDown className="h-4 w-4 shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuRadioGroup
                value={statusFilter}
                onValueChange={(v) => {
                  if (v === 'all' || v === 'active' || v === 'inactive') setStatusFilter(v);
                }}
              >
                <DropdownMenuRadioItem value="all">Semua Status</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="active">Aktif</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="inactive">Tidak Aktif</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button type="button" onClick={handleAddRow}>
            <Plus /> {labels.header?.tambahButton ?? 'Tambah'}
          </Button>
        </div>
      </div>

      {/* Table */}
      <DataTable<BOQTemplateRow, unknown>
        columns={columns}
        data={filteredData}
        getRowId={(row) => row.id}
        initialPage={initialPage}
        initialPageSize={initialPageSize}
        onPaginationChange={onPaginationChange}
        totalItems={totalItems ?? filteredData.length}
        totalPages={totalPages}
        enablePagination
        pageSizeOptions={[5, 10, 20, 50]}
        enableColumnDnd={false}
        enableColumnResize={false}
        emptyMessage="Belum ada data"
        enableRangeSelection
        onCellEdit={handleCellEdit}
        contextMenu={(row) => {
          const rowData = row.original;
          const ctxLabels = labels.contextMenu ?? {};
          return (
            <>
              <ContextMenuItem onClick={() => handleCut(rowData)}>
                <Scissors /> {ctxLabels.cut ?? 'Potong'}
              </ContextMenuItem>
              <ContextMenuItem onClick={() => handleCopy(rowData)}>
                <Copy /> {ctxLabels.copy ?? 'Salin'}
              </ContextMenuItem>
              <ContextMenuItem
                disabled={!clipboardRef.current}
                onClick={() => handlePaste(rowData)}
              >
                <Clipboard /> {ctxLabels.paste ?? 'Tempel'}
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem onClick={() => handleInsertAbove(rowData)}>
                <ArrowUpToLine /> {ctxLabels.insertAbove ?? 'Sisipkan baris di atas'}
              </ContextMenuItem>
              <ContextMenuItem onClick={() => handleInsertBelow(rowData)}>
                <ArrowDownToLine /> {ctxLabels.insertBelow ?? 'Sisipkan baris di bawah'}
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem variant="destructive" onClick={() => handleDelete(rowData)}>
                <Trash2 /> {ctxLabels.delete ?? 'Hapus baris'}
              </ContextMenuItem>
            </>
          );
        }}
      />
    </div>
  );
}

export default BOQTemplateList;
