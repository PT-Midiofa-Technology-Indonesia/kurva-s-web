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
import { generateId } from '@/shared/utils/generate-id';

interface HierarchyTemplateRow {
  id: string;
  name: string;
  projectCapability: string;
  projectCapabilityId: string;
  status: 'active' | 'inactive';
}

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

function getRowId(row: HierarchyTemplateRow) {
  return row.id;
}

interface HierarchyTableProps {
  data: HierarchyTemplateRow[];
  columns: ColumnDef<HierarchyTemplateRow>[];
  initialPage: number;
  initialPageSize: number;
  totalItems: number;
  totalPages?: number;
  isLoading?: boolean;
  onPaginationChange?: (page: number, perPage: number) => void;
  onCellEdit: (
    rowIndex: number,
    columnId: string,
    val: unknown,
    row?: HierarchyTemplateRow
  ) => void;
  contextMenu: (
    row: Row<HierarchyTemplateRow>,
    options?: {
      activeCellInfo?: { rowIndex: number; colIndex: number; columnId: string; value: unknown };
      triggerCopy?: () => void;
      triggerCut?: () => void;
    }
  ) => React.ReactNode;
}

const HierarchyTable = memo(function HierarchyTable({
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
}: HierarchyTableProps) {
  return (
    <DataTable<HierarchyTemplateRow, unknown>
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

export interface ProjectHierarchyTemplateListWithSuggestionsProps {
  value: HierarchyTemplateRow[];
  onChange: (next: HierarchyTemplateRow[]) => void;
  onSave?: (rows: HierarchyTemplateRow[]) => Promise<void> | void;
  isSaving?: boolean;
  isLoading?: boolean;
  projectCapabilityOptions?: { label: string; value: string }[];
  projectCapabilityHasMore?: boolean;
  onLoadMoreProjectCapability?: () => void;
  onView?: (row: HierarchyTemplateRow) => void;
  initialPage?: number;
  initialPageSize?: number;
  totalItems?: number;
  totalPages?: number;
  onPaginationChange?: (page: number, perPage: number) => void;
  onSearchChange?: (value: string) => void;
  onStatusChange?: (value: string) => void;
}

export function ProjectHierarchyTemplateListWithSuggestions({
  value,
  onChange,
  onSave,
  isSaving,
  isLoading,
  projectCapabilityOptions = [],
  projectCapabilityHasMore,
  onLoadMoreProjectCapability,
  onView,
  initialPage = 1,
  initialPageSize = 10,
  totalItems,
  totalPages,
  onPaginationChange,
  onSearchChange,
  onStatusChange,
}: ProjectHierarchyTemplateListWithSuggestionsProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const clipboardRef = useRef<string | null>(null);
  const cutSourceRef = useRef<{ rowId: string; columnId: string } | null>(null);

  const handleAddRow = useCallback(() => {
    const newRow: HierarchyTemplateRow = {
      id: generateId(),
      name: '',
      projectCapability: '',
      projectCapabilityId: '',
      status: 'inactive',
    };
    onChange([...value, newRow]);
    setIsDirty(true);
  }, [value, onChange]);

  const handleInsertAbove = useCallback(
    (target: HierarchyTemplateRow) => {
      const idx = value.findIndex((r) => r.id === target.id);
      const newRow: HierarchyTemplateRow = {
        id: generateId(),
        name: '',
        projectCapability: '',
        projectCapabilityId: '',
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
    (target: HierarchyTemplateRow) => {
      const idx = value.findIndex((r) => r.id === target.id);
      const newRow: HierarchyTemplateRow = {
        id: generateId(),
        name: '',
        projectCapability: '',
        projectCapabilityId: '',
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
    (target: HierarchyTemplateRow) => {
      onChange(value.filter((r) => r.id !== target.id));
      setIsDirty(true);
    },
    [value, onChange]
  );

  const handleCellEdit = useCallback(
    (_rowIndex: number, columnId: string, val: unknown, row?: HierarchyTemplateRow) => {
      if (!row) return;
      const cellValue = val == null ? '' : String(val);
      let updated = value.map((r) => (r.id === row.id ? { ...r, [columnId]: cellValue } : r));

      // Sync projectCapabilityId when projectCapability (display name) changes
      if (columnId === 'projectCapability' && cellValue) {
        const match = projectCapabilityOptions.find((o) => o.label === cellValue);
        if (match) {
          updated = updated.map((r) =>
            r.id === row.id ? { ...r, projectCapabilityId: match.value } : r
          );
        }
      }

      onChange(updated);
      setIsDirty(true);
    },
    [value, onChange, projectCapabilityOptions]
  );

  const columns = useMemo<ColumnDef<HierarchyTemplateRow>[]>(
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
        header: '',
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
        header: 'Nama Template',
        meta: {
          editable: true,
        },
      },
      {
        id: 'projectCapability',
        accessorKey: 'projectCapability',
        header: 'Project Capability',
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
        header: 'Status',
        size: 120,
        cell: ({ row }) => {
          const isActive = row.original.status === 'active';
          return (
            <Badge variant={isActive ? 'success' : 'destructive'}>
              {isActive ? 'Aktif' : 'Tidak Aktif'}
            </Badge>
          );
        },
        meta: {
          editable: true,
          edit: {
            editType: 'select',
            selectOptions: [
              { label: 'Aktif', value: 'active' },
              { label: 'Tidak Aktif', value: 'inactive' },
            ],
          },
        },
      },
    ],
    [projectCapabilityOptions, projectCapabilityHasMore, onLoadMoreProjectCapability, onView]
  );

  const contextMenu = useCallback(
    (
      row: Row<HierarchyTemplateRow>,
      options?: {
        activeCellInfo?: { rowIndex: number; colIndex: number; columnId: string; value: unknown };
        triggerCopy?: () => void;
        triggerCut?: () => void;
      }
    ) => {
      const rowData = row.original;
      const activeCellInfo = options?.activeCellInfo;

      const handleCopy = () => {
        if (activeCellInfo) {
          clipboardRef.current = JSON.stringify(activeCellInfo.value);
          cutSourceRef.current = null;
          options?.triggerCopy?.();
        }
      };

      const handleCut = () => {
        if (activeCellInfo) {
          clipboardRef.current = JSON.stringify(activeCellInfo.value);
          cutSourceRef.current = { rowId: rowData.id, columnId: activeCellInfo.columnId };
          options?.triggerCut?.();
        }
      };

      const handlePaste = () => {
        if (!clipboardRef.current) return;
        const pastedValue = JSON.parse(clipboardRef.current);
        if (activeCellInfo) {
          handleCellEdit(activeCellInfo.rowIndex, activeCellInfo.columnId, pastedValue, rowData);
        }
      };

      return (
        <>
          <ContextMenuItem onClick={handleCopy}>
            <Copy className="mr-2 h-4 w-4" />
            Salin
          </ContextMenuItem>
          <ContextMenuItem onClick={handleCut}>
            <Scissors className="mr-2 h-4 w-4" />
            Potong
          </ContextMenuItem>
          <ContextMenuItem onClick={handlePaste} disabled={!clipboardRef.current}>
            <Clipboard className="mr-2 h-4 w-4" />
            Tempel
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem onClick={() => handleInsertAbove(rowData)}>
            <ArrowUpToLine className="mr-2 h-4 w-4" />
            Sisipkan baris di atas
          </ContextMenuItem>
          <ContextMenuItem onClick={() => handleInsertBelow(rowData)}>
            <ArrowDownToLine className="mr-2 h-4 w-4" />
            Sisipkan baris di bawah
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem
            onClick={() => handleDelete(rowData)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Hapus baris
          </ContextMenuItem>
        </>
      );
    },
    [handleCellEdit, handleInsertAbove, handleInsertBelow, handleDelete]
  );

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
      {/* Filter bar — matching ListPageTemplate p-4 layout */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-slate-200">
        <div className="relative w-[288px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              onSearchChange?.(e.target.value);
            }}
            placeholder="Pencarian"
            className="w-full pl-10"
            disabled={isDirty}
          />
        </div>

        <div className="flex items-center gap-3">
          <AsyncSelect
            className="w-48 focus:ring-1 ring-primary"
            options={[
              { value: 'true', label: 'Aktif' },
              { value: 'false', label: 'Tidak Aktif' },
            ]}
            value={statusFilter || ''}
            isSearchable={false}
            onChange={(v: any) => {
              const val = Array.isArray(v) ? v[0] : v;
              const next = typeof val === 'string' ? val : '';
              setStatusFilter(next);
              onStatusChange?.(next);
            }}
            isClearable
          />

          {isDirty ? (
            <Button
              leftIcon={<Save />}
              type="button"
              variant="outline"
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
              Tambah
            </Button>
          )}
        </div>
      </div>

      {/* Table — flush to card edges, no extra wrapper padding */}
      <HierarchyTable
        data={value}
        columns={columns}
        initialPage={initialPage}
        initialPageSize={initialPageSize}
        totalItems={totalItems ?? 0}
        totalPages={totalPages}
        isLoading={isLoading}
        onPaginationChange={onPaginationChange}
        onCellEdit={handleCellEdit}
        contextMenu={contextMenu}
      />
    </div>
  );
}
