'use client';

import type { ColumnDef, Row } from '@tanstack/react-table';
import {
  ClipboardPaste,
  Copy,
  Download,
  MoreVertical,
  Plus,
  Save,
  Trash2,
  Upload,
} from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { Button } from '@/components/atoms';
import { DataTable } from '@/components/organisms/DataTable';
import { ContextMenuItem, ContextMenuSeparator } from '@/components/ui/context-menu';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { COMMON_LABELS } from '@/shared/constants';
import { formatCurrencyIDR } from '@/shared/utils/format';
import { VENDOR_CATALOG_LABELS } from '../constants';
import { useItemCatalogImportExport } from '../hooks/use-item-catalog-import-export';
import { useVendorItemCatalogPage } from '../hooks/use-vendor-item-catalog-page';
import type { VendorItemCatalogDraftRow } from '../types';

interface VendorItemCatalogListProps {
  vendorId: string;
}

interface ContextMenuOptions {
  activeCellInfo?: { rowIndex: number; colIndex: number; columnId: string; value: unknown };
  rangeBounds?: { minRow: number; maxRow: number; minCol: number; maxCol: number };
  rangeValues?: unknown[][];
  rangeRowIndices?: number[];
  triggerCopy?: () => void;
  triggerCut?: () => void;
  triggerPaste?: () => Promise<void>;
}

export function VendorItemCatalogList({ vendorId }: VendorItemCatalogListProps) {
  const {
    rows,
    isLoading,
    isError,
    isDirty,
    isSaving,
    hasMore,
    isFetchingMore,
    loadMore,
    itemCatalogOptions,
    itemCatalogHasMore,
    loadMoreItemCatalogs,
    setItemCatalogSearch,
    hasInvalidRows,
    addRow,
    handleCellEdit,
    handleDeleteRow,
    handleSave,
    refetch,
  } = useVendorItemCatalogPage({ vendorId });

  const [selectedRows, setSelectedRows] = useState<VendorItemCatalogDraftRow[]>([]);
  const { fileInputRef, isDownloading, isImporting, handleDownloadTemplate, handleImport } =
    useItemCatalogImportExport({ vendorId, onSuccess: refetch });

  const statusSelectOptions = useMemo(
    () =>
      VENDOR_CATALOG_LABELS.ITEM_CATALOG.STATUS_OPTIONS.map((o) => ({
        value: o.value,
        label: o.label,
      })),
    []
  );

  const columns = useMemo<ColumnDef<VendorItemCatalogDraftRow>[]>(
    () => [
      {
        id: 'code',
        accessorKey: 'code',
        header: VENDOR_CATALOG_LABELS.ITEM_CATALOG.COLUMNS.CODE,
        size: 120,
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            {row.original.isNew && (
              <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium uppercase text-emerald-700">
                {VENDOR_CATALOG_LABELS.ITEM_CATALOG.MESSAGES.ROW_NEW}
              </span>
            )}
            <span>{row.original.code || '-'}</span>
          </div>
        ),
      },
      {
        id: 'itemCatalogId',
        accessorKey: 'itemCatalogId',
        header: VENDOR_CATALOG_LABELS.ITEM_CATALOG.COLUMNS.NAME,
        size: 260,
        enableSorting: false,
        cell: ({ row }) => row.original.name || '-',
        meta: {
          editable: true,
          edit: {
            editType: 'async-select' as const,
            selectOptions: itemCatalogOptions,
            selectHasNextPage: itemCatalogHasMore,
            selectOnLoadMore: loadMoreItemCatalogs,
            selectOnSearch: setItemCatalogSearch,
          },
        },
      },
      {
        id: 'price',
        accessorKey: 'price',
        header: VENDOR_CATALOG_LABELS.ITEM_CATALOG.COLUMNS.PRICE,
        size: 160,
        enableSorting: false,
        cell: ({ row }) => formatCurrencyIDR(row.original.price),
        meta: {
          editable: true,
        },
      },
      {
        id: 'uom',
        header: VENDOR_CATALOG_LABELS.ITEM_CATALOG.COLUMNS.UOM,
        size: 100,
        enableSorting: false,
        cell: ({ row }) => row.original.uomName ?? '-',
      },
      {
        id: 'isActive',
        accessorKey: 'isActive',
        header: VENDOR_CATALOG_LABELS.ITEM_CATALOG.COLUMNS.STATUS,
        size: 120,
        enableSorting: false,
        cell: ({ row }) =>
          row.original.isActive ? COMMON_LABELS.STATUS.ACTIVE : COMMON_LABELS.STATUS.INACTIVE,
        meta: {
          editable: true,
          edit: {
            editType: 'select' as const,
            selectOptions: statusSelectOptions,
          },
        },
      },
    ],
    [
      itemCatalogOptions,
      itemCatalogHasMore,
      loadMoreItemCatalogs,
      setItemCatalogSearch,
      statusSelectOptions,
    ]
  );

  const handleContextMenu = useCallback(
    (row: Row<VendorItemCatalogDraftRow>, options: ContextMenuOptions = {}) => {
      const { activeCellInfo, rangeBounds, triggerCopy, triggerPaste } = options;
      const target = row.original;
      const ctxLabels = VENDOR_CATALOG_LABELS.ITEM_CATALOG.CONTEXT_MENU;

      return (
        <>
          <ContextMenuItem
            onClick={() => {
              if (rangeBounds && triggerCopy) {
                triggerCopy();
              } else {
                const valueToCopy = activeCellInfo?.value ?? target.name ?? '';
                navigator.clipboard.writeText(String(valueToCopy)).catch(() => undefined);
              }
            }}
          >
            <Copy />
            {ctxLabels.COPY}
          </ContextMenuItem>
          <ContextMenuItem
            disabled={!activeCellInfo}
            onClick={async () => {
              await triggerPaste?.();
            }}
          >
            <ClipboardPaste />
            {ctxLabels.PASTE}
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem
            variant="destructive"
            onClick={() => {
              handleDeleteRow(target);
            }}
          >
            <Trash2 />
            {ctxLabels.DELETE_ROW}
          </ContextMenuItem>
        </>
      );
    },
    [handleDeleteRow]
  );

  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-slate-950">
            {VENDOR_CATALOG_LABELS.ITEM_CATALOG.TITLE}
          </h2>
          {isDirty && (
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-xs font-medium',
                hasInvalidRows ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
              )}
            >
              {VENDOR_CATALOG_LABELS.ITEM_CATALOG.MESSAGES.UNSAVED}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isDirty ? (
            <Button
              variant="default"
              leftIcon={<Save />}
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              isLoading={isSaving}
            >
              {isSaving
                ? VENDOR_CATALOG_LABELS.ITEM_CATALOG.BUTTONS.SAVING
                : VENDOR_CATALOG_LABELS.ITEM_CATALOG.BUTTONS.SAVE_ALL}
            </Button>
          ) : (
            <Button
              type="button"
              variant="default"
              onClick={addRow}
              disabled={isSaving}
              className="gap-1.5"
            >
              <Plus className="h-4 w-4" />
              {VENDOR_CATALOG_LABELS.ITEM_CATALOG.BUTTONS.ADD_ROW}
            </Button>
          )}
          {selectedRows.length > 0 && (
            <Button
              type="button"
              variant="destructive"
              leftIcon={<Trash2 />}
              onClick={() => {
                for (const row of selectedRows) handleDeleteRow(row);
                setSelectedRows([]);
              }}
              disabled={isSaving}
            >
              {VENDOR_CATALOG_LABELS.ITEM_CATALOG.CONTEXT_MENU.DELETE_ROW} ({selectedRows.length})
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isDownloading || isImporting}
                className="h-9 w-9 p-0"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-max">
              <DropdownMenuItem onClick={handleDownloadTemplate} disabled={isDownloading}>
                <Download className="h-4 w-4" />
                {VENDOR_CATALOG_LABELS.ITEM_CATALOG.BUTTONS.DOWNLOAD_TEMPLATE}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => fileInputRef.current?.click()}
                disabled={isImporting}
              >
                <Upload className="h-4 w-4" />
                {VENDOR_CATALOG_LABELS.ITEM_CATALOG.BUTTONS.IMPORT}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImport(file);
            }}
          />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <DataTable
          data={rows}
          columns={columns}
          isLoading={isLoading}
          enablePagination={false}
          enableColumnDnd={false}
          enableColumnResize={false}
          enableZebraStripes={false}
          enableRangeSelection
          onCellEdit={handleCellEdit}
          contextMenu={handleContextMenu}
          className="shadow-none rounded-none"
          emptyMessage={VENDOR_CATALOG_LABELS.ITEM_CATALOG.EMPTY}
          enableRowSelection
          onRowSelectionChange={(rows) => setSelectedRows(rows as VendorItemCatalogDraftRow[])}
          nonEditableTooltip={({ header }) => `Cell ${header} tidak dapat diubah!`}
        />
        {isError && (
          <div className="border-t border-slate-200 px-4 py-3 text-sm text-red-600">
            Gagal memuat data item catalog.
          </div>
        )}
        {hasMore && (
          <div className="border-t border-slate-200 px-4 py-3 flex justify-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={loadMore}
              disabled={isFetchingMore}
              isLoading={isFetchingMore}
            >
              {VENDOR_CATALOG_LABELS.ITEM_CATALOG.BUTTONS.LOAD_MORE}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
