'use client';

import type { ColumnDef, Row } from '@tanstack/react-table';
import {
  ArrowDownToLine,
  ArrowUpToLine,
  Clipboard,
  Copy,
  Eye,
  Plus,
  Save,
  Scissors,
  Search,
  Trash2,
} from 'lucide-react';
import { memo, useCallback, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { DataTable } from '@/components/organisms/DataTable';
import { Badge } from '@/components/ui/badge';
import { ContextMenuItem, ContextMenuSeparator } from '@/components/ui/context-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AsyncSelect } from '@/shared/components/atoms';
import type { BOQTemplateRow } from '@/shared/components/templates/BOQ/BOQTemplate/BOQTemplateList';
import type { BOQTemplateListLabels } from '@/shared/components/templates/BOQ/types/boq-labels.types';
import { COMMON_STATUS_OPTIONS } from '@/shared/constants';
import { generateId } from '@/shared/utils/generate-id';

const DEFAULT_TEMPLATE_LIST_LABELS: BOQTemplateListLabels = {
  header: {
    title: 'BoQ Template',
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

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

function getRowId(row: BOQTemplateRow) {
  return row.id;
}

interface BOQTemplateTableProps {
  data: BOQTemplateRow[];
  columns: ColumnDef<BOQTemplateRow>[];
  initialPage: number;
  initialPageSize: number;
  totalItems: number;
  totalPages?: number;
  isLoading?: boolean;
  onPaginationChange?: (page: number, perPage: number) => void;
  onCellEdit: (rowIndex: number, columnId: string, val: unknown, row?: BOQTemplateRow) => void;
  contextMenu: (
    row: Row<BOQTemplateRow>,
    options?: {
      activeCellInfo?: { rowIndex: number; colIndex: number; columnId: string; value: unknown };
      triggerCopy?: () => void;
      triggerCut?: () => void;
    }
  ) => React.ReactNode;
}

const BOQTemplateTable = memo(function BOQTemplateTable({
  data,
  columns,
  initialPage,
  initialPageSize,
  totalItems,
  totalPages,
  isLoading,
  onPaginationChange,
  onCellEdit,
  contextMenu,
}: BOQTemplateTableProps) {
  return (
    <DataTable<BOQTemplateRow, unknown>
      columns={columns}
      data={data}
      getRowId={getRowId}
      initialPage={initialPage}
      initialPageSize={initialPageSize}
      onPaginationChange={onPaginationChange}
      totalItems={totalItems}
      totalPages={totalPages}
      isLoading={isLoading}
      enablePagination
      pageSizeOptions={PAGE_SIZE_OPTIONS}
      enableColumnDnd={false}
      enableColumnResize={false}
      emptyMessage="Belum ada data"
      enableRangeSelection
      onCellEdit={onCellEdit}
      contextMenu={contextMenu}
    />
  );
});

export interface BOQTemplateListWithSuggestionsProps {
  value: BOQTemplateRow[];
  onChange: (next: BOQTemplateRow[]) => void;
  onSave?: (rows: BOQTemplateRow[]) => Promise<void> | void;
  isSaving?: boolean;
  isLoading?: boolean;
  projectCapabilityOptions?: { label: string; value: string }[];
  projectCapabilityHasMore?: boolean;
  onLoadMoreProjectCapability?: () => void;
  title?: string;
  searchPlaceholder?: string;
  onView?: (row: BOQTemplateRow) => void;
  initialPage?: number;
  initialPageSize?: number;
  totalItems?: number;
  totalPages?: number;
  onPaginationChange?: (page: number, perPage: number) => void;
  labels?: BOQTemplateListLabels;
  onSearchChange?: (value: string) => void;
  onStatusChange?: (value: string) => void;
}

export function BOQTemplateListWithSuggestions({
  value,
  onChange,
  onSave,
  isSaving,
  isLoading,
  projectCapabilityOptions = [],
  projectCapabilityHasMore,
  onLoadMoreProjectCapability,
  title: titleProp,
  searchPlaceholder: searchPlaceholderProp,
  onView,
  initialPage = 1,
  initialPageSize = 10,
  totalItems,
  totalPages,
  onPaginationChange,
  labels: labelsProp,
  onSearchChange,
  onStatusChange,
}: BOQTemplateListWithSuggestionsProps) {
  const labels = useMemo(() => ({ ...DEFAULT_TEMPLATE_LIST_LABELS, ...labelsProp }), [labelsProp]);
  const title = titleProp ?? labels.header?.title ?? 'Daftar Template';
  const searchPlaceholder =
    searchPlaceholderProp ?? labels.header?.searchPlaceholder ?? 'Pencarian';
  const unsavedChangesLabel = labels.tooltips?.unsavedChanges ?? 'Perubahan belum disimpan!';
  const [search, setSearch] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const clipboardRef = useRef<string | null>(null);
  const cutSourceRef = useRef<{ rowId: string; columnId: string } | null>(null);

  const handleAddRow = useCallback(() => {
    const newRow: BOQTemplateRow = {
      id: generateId(),
      name: '',
      projectCapability: '',
      status: 'inactive',
    };
    onChange([...value, newRow]);
    setIsDirty(true);
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
      setIsDirty(true);
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
      setIsDirty(true);
    },
    [value, onChange]
  );

  const handleDelete = useCallback(
    (target: BOQTemplateRow) => {
      onChange(value.filter((r) => r.id !== target.id));
      setIsDirty(true);
    },
    [value, onChange]
  );

  const handleCellEdit = useCallback(
    (_rowIndex: number, columnId: string, val: unknown, row?: BOQTemplateRow) => {
      if (!row) return;
      const cellValue = val == null ? '' : String(val);
      const updated = value.map((r) => (r.id === row.id ? { ...r, [columnId]: cellValue } : r));
      onChange(updated);
      setIsDirty(true);
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
        meta: {
          editable: true,
        },
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
            comboboxHasNextPage: projectCapabilityHasMore,
            comboboxOnLoadMore: onLoadMoreProjectCapability,
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
    [
      onView,
      projectCapabilityOptions,
      projectCapabilityHasMore,
      onLoadMoreProjectCapability,
      labels,
    ]
  );

  const contextMenu = useCallback(
    (
      row: Row<BOQTemplateRow>,
      options?: {
        activeCellInfo?: { rowIndex: number; colIndex: number; columnId: string; value: unknown };
        triggerCopy?: () => void;
        triggerCut?: () => void;
      }
    ) => {
      const rowData = row.original;
      const ctxLabels = labels.contextMenu ?? {};
      const cellValue = options?.activeCellInfo?.value;

      return (
        <>
          <ContextMenuItem
            onClick={() => {
              if (cellValue == null) return;
              clipboardRef.current = String(cellValue);
              cutSourceRef.current = {
                rowId: rowData.id,
                columnId: options!.activeCellInfo!.columnId,
              };
              options?.triggerCut?.();
            }}
          >
            <Scissors /> {ctxLabels.cut ?? 'Potong'}
          </ContextMenuItem>
          <ContextMenuItem
            onClick={() => {
              if (cellValue == null) return;
              clipboardRef.current = String(cellValue);
              cutSourceRef.current = null;
              options?.triggerCopy?.();
            }}
          >
            <Copy /> {ctxLabels.copy ?? 'Salin'}
          </ContextMenuItem>
          <ContextMenuItem
            disabled={clipboardRef.current == null || !options?.activeCellInfo}
            onClick={() => {
              const activeInfo = options?.activeCellInfo;
              const val = clipboardRef.current;
              const cutSrc = cutSourceRef.current;
              if (!activeInfo || val == null) return;
              let updated = value;
              updated = updated.map((r) =>
                r.id === rowData.id ? { ...r, [activeInfo.columnId]: String(val) } : r
              );
              if (cutSrc) {
                updated = updated.map((r) =>
                  r.id === cutSrc.rowId ? { ...r, [cutSrc.columnId]: '' } : r
                );
                cutSourceRef.current = null;
              }
              clipboardRef.current = null;
              onChange(updated);
              setIsDirty(true);
              document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
            }}
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
    },
    [value, onChange, handleInsertAbove, handleInsertBelow, handleDelete, labels]
  );

  const handleStatusFilterChange = useCallback(
    (value: string | string[] | null | undefined) => {
      const stringValue = Array.isArray(value) ? value[0] : value;
      const next = stringValue == null ? 'all' : stringValue;
      onStatusChange?.(next);
    },
    [onStatusChange]
  );

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-6 border-b border-slate-200">
        <h2 className="text-lg font-semibold">{title}</h2>
        <div className="flex items-center gap-4">
          <TooltipProvider>
            <Tooltip open={isDirty ? undefined : false}>
              <TooltipTrigger asChild>
                <div className="relative w-[288px]">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <Input
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      onSearchChange?.(e.target.value);
                    }}
                    placeholder={searchPlaceholder}
                    className="w-full pl-10"
                    disabled={isDirty}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>{unsavedChangesLabel}</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip open={isDirty ? undefined : false}>
              <TooltipTrigger asChild>
                <div>
                  <AsyncSelect
                    className="w-48"
                    options={COMMON_STATUS_OPTIONS}
                    placeholder="Semua Status"
                    isSearchable={false}
                    onChange={handleStatusFilterChange}
                    isClearable
                    isDisabled={isDirty}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>{unsavedChangesLabel}</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {isDirty ? (
            <Button
              leftIcon={<Save />}
              type="button"
              variant={'outline'}
              onClick={async () => {
                try {
                  await onSave?.(value);
                  setIsDirty(false);
                } catch {
                  // keep isDirty true so Save button remains visible
                }
              }}
              disabled={isSaving}
            >
              {isSaving ? 'Menyimpan...' : 'Simpan'}
            </Button>
          ) : (
            <Button type="button" onClick={handleAddRow} leftIcon={<Plus />}>
              {labels.header?.tambahButton ?? 'Tambah'}
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <BOQTemplateTable
        data={value}
        columns={columns}
        initialPage={initialPage}
        initialPageSize={initialPageSize}
        totalItems={totalItems ?? value.length}
        totalPages={totalPages}
        isLoading={isLoading}
        onPaginationChange={onPaginationChange}
        onCellEdit={handleCellEdit}
        contextMenu={contextMenu}
      />
    </div>
  );
}
