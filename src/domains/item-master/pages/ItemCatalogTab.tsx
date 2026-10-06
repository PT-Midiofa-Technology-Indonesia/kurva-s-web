'use client';

import type { ColumnDef, Row } from '@tanstack/react-table';
import {
  Download,
  EllipsisVertical,
  Eye,
  MoreVertical,
  Pencil,
  PlusIcon,
  Trash2,
  Upload,
} from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { useQueryParams } from '@/hooks/use-query-params';
import { AsyncSelect, Button } from '@/shared/components/atoms';
import { ConfirmDialog } from '@/shared/components/molecules/AlertDialog';
import { ListPageTemplate } from '@/shared/components/templates/ListPageTemplate';
import { Badge, Separator } from '@/shared/components/ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { useDebounce } from '@/shared/hooks/use-debounce';
import type { BaseQueryParams } from '@/types/query-params';
import { ItemCatalogDetailDrawer } from '../components/ItemCatalogDetailDrawer';
import { ITEM_CATALOG_LABELS, STATUS_OPTIONS } from '../constants';
import { useItemCatalogImportExport } from '../hooks/use-item-catalog-import-export';
import { useItemCatalogTabPage } from '../hooks/use-item-catalog-tab-page';
import { useItemCategoriesInfinite } from '../hooks/use-item-categories-infinite';
import { useItemTypesInfinite } from '../hooks/use-item-types-infinite';
import type { ItemCatalogListItem } from '../types';

interface ItemCatalogTabUrlParams extends BaseQueryParams {
  tab?: string;
  isActive?: string;
}

function ItemCatalogActionsCell({
  row,
  onDetail,
  onEdit,
  onDeleteClick,
}: {
  row: Row<ItemCatalogListItem>;
  onDetail: (item: ItemCatalogListItem) => void;
  onEdit: (item: ItemCatalogListItem) => void;
  onDeleteClick: (item: ItemCatalogListItem) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-6 w-6 p-0">
          <EllipsisVertical className="h-4 w-4 text-slate-950" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onEdit(row.original)}>
          <Pencil className="mr-2 h-4 w-4" />
          {ITEM_CATALOG_LABELS.LIST.ACTIONS.EDIT}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onDetail(row.original)}>
          <Eye className="mr-2 h-4 w-4" />
          {ITEM_CATALOG_LABELS.LIST.ACTIONS.DETAIL}
        </DropdownMenuItem>
        <Separator className="flex-1 h-[0.05rem]" />
        <DropdownMenuItem
          onClick={() => onDeleteClick(row.original)}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          {ITEM_CATALOG_LABELS.LIST.ACTIONS.DELETE}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function ItemCatalogTab() {
  const { queryParams, updateQueryParam, setQueryParams } =
    useQueryParams<ItemCatalogTabUrlParams>();

  const [itemTypeSearch, setItemTypeSearch] = useState('');
  const [itemCategorySearch, setItemCategorySearch] = useState('');
  const debouncedItemTypeSearch = useDebounce(itemTypeSearch, 300);
  const debouncedItemCategorySearch = useDebounce(itemCategorySearch, 300);

  const {
    options: itemTypeOptions,
    hasMore: hasMoreItemTypes,
    isFetchingNextPage: isFetchingMoreItemTypes,
    loadMore: loadMoreItemTypes,
  } = useItemTypesInfinite({ search: debouncedItemTypeSearch });

  const {
    options: itemCategoryOptions,
    hasMore: hasMoreItemCategories,
    isFetchingNextPage: isFetchingMoreItemCategories,
    loadMore: loadMoreItemCategories,
  } = useItemCategoriesInfinite({ search: debouncedItemCategorySearch });

  const handleItemTypeSearchChange = useCallback((v: string) => setItemTypeSearch(v), []);
  const handleItemTypeScrollToBottom = useCallback(() => {
    if (hasMoreItemTypes && !isFetchingMoreItemTypes) loadMoreItemTypes();
  }, [hasMoreItemTypes, isFetchingMoreItemTypes, loadMoreItemTypes]);

  const handleItemCategorySearchChange = useCallback((v: string) => setItemCategorySearch(v), []);
  const handleItemCategoryScrollToBottom = useCallback(() => {
    if (hasMoreItemCategories && !isFetchingMoreItemCategories) loadMoreItemCategories();
  }, [hasMoreItemCategories, isFetchingMoreItemCategories, loadMoreItemCategories]);

  const params = useMemo(
    () => ({
      page: queryParams.page ?? 1,
      perPage: queryParams.perPage ?? 10,
      sortBy: queryParams.sortBy ?? 'name',
      sortOrder: (queryParams.sortOrder || 'asc') as 'asc' | 'desc',
      search: queryParams.search,
      isActive:
        queryParams.isActive === 'true'
          ? true
          : queryParams.isActive === 'false'
            ? false
            : undefined,
      itemTypeId: typeof queryParams.itemTypeId === 'string' ? queryParams.itemTypeId : undefined,
      itemCategoryId:
        typeof queryParams.itemCategoryId === 'string' ? queryParams.itemCategoryId : undefined,
    }),
    [queryParams]
  );

  const pageOptions = useMemo(
    () => ({
      params,
      onUpdateQueryParam: updateQueryParam,
      onSetQueryParams: setQueryParams,
    }),
    [params, updateQueryParam, setQueryParams]
  );

  const {
    itemCatalogs,
    totalItems,
    totalPages,
    isLoading,
    isError,
    deleteTarget,
    setDeleteTarget,
    isDeleting,
    handleDeleteClick,
    handleDeleteConfirm,
    handleAdd,
    handleEdit,
    detailTarget,
    handleDetail,
    handleDetailClose,
    handleDetailEdit,
    handleSearchChange,
    handleIsActiveChange,
    handleItemTypeChange,
    handleItemCategoryChange,
    handleSort,
    handlePaginationChange,
  } = useItemCatalogTabPage(pageOptions);

  const { fileInputRef, isDownloading, isImporting, handleDownloadTemplate, handleImport } =
    useItemCatalogImportExport();

  void ItemCatalogActionsCell;
  void PlusIcon;
  void handleAdd;
  void handleEdit;
  void handleDetail;
  void handleDeleteClick;
  void handleImport;

  const columns = useMemo<ColumnDef<ItemCatalogListItem>[]>(
    () => [
      {
        accessorKey: 'code',
        header: ITEM_CATALOG_LABELS.LIST.COLUMNS.CODE,
        size: 120,
      },
      {
        accessorKey: 'name',
        header: ITEM_CATALOG_LABELS.LIST.COLUMNS.NAME,
        size: 200,
      },
      {
        id: 'itemType',
        header: ITEM_CATALOG_LABELS.LIST.COLUMNS.ITEM_TYPE,
        size: 140,
        cell: ({ row }) => <Badge variant="secondary">{row.original.itemType?.name ?? '-'}</Badge>,
      },
      {
        id: 'itemCategory',
        header: ITEM_CATALOG_LABELS.LIST.COLUMNS.ITEM_CATEGORY,
        size: 160,
        cell: ({ row }) => (
          <Badge variant="secondary">{row.original.itemCategory?.name ?? '-'}</Badge>
        ),
      },
      {
        accessorKey: 'status',
        header: ITEM_CATALOG_LABELS.LIST.COLUMNS.STATUS,
        size: 100,
        cell: ({ row }) =>
          row.original.isActive ? (
            <Badge variant="success">{ITEM_CATALOG_LABELS.LIST.STATUS.ACTIVE}</Badge>
          ) : (
            <Badge variant="destructive">{ITEM_CATALOG_LABELS.LIST.STATUS.INACTIVE}</Badge>
          ),
      },
      {
        id: 'actions',
        header: ITEM_CATALOG_LABELS.LIST.COLUMNS.ACTIONS,
        enableSorting: false,
        enableHiding: false,
        size: 60,
        cell: ({ row }) => (
          <ItemCatalogActionsCell
            row={row}
            onDetail={handleDetail}
            onEdit={handleEdit}
            onDeleteClick={handleDeleteClick}
          />
        ),
      },
    ],
    [handleDetail, handleEdit, handleDeleteClick]
  );

  const filters = useMemo(
    () => (
      <div className="flex gap-3">
        <AsyncSelect
          className="w-48 focus:ring-1 ring-primary"
          options={itemTypeOptions}
          placeholder={ITEM_CATALOG_LABELS.LIST.FILTERS.ITEM_TYPE}
          isSearchable
          onChange={handleItemTypeChange}
          isClearable
          onScrollToBottom={handleItemTypeScrollToBottom}
          onSearchChange={handleItemTypeSearchChange}
        />
        <AsyncSelect
          className="w-48 focus:ring-1 ring-primary"
          options={itemCategoryOptions}
          placeholder={ITEM_CATALOG_LABELS.LIST.FILTERS.ITEM_CATEGORY}
          isSearchable
          onChange={handleItemCategoryChange}
          isClearable
          onScrollToBottom={handleItemCategoryScrollToBottom}
          onSearchChange={handleItemCategorySearchChange}
        />
        <AsyncSelect
          className="w-48 focus:ring-1 ring-primary"
          options={STATUS_OPTIONS}
          placeholder={ITEM_CATALOG_LABELS.LIST.FILTERS.STATUS}
          isSearchable={false}
          onChange={handleIsActiveChange}
          isClearable
        />
      </div>
    ),
    [
      handleIsActiveChange,
      handleItemTypeChange,
      handleItemCategoryChange,
      itemTypeOptions,
      itemCategoryOptions,
      handleItemTypeScrollToBottom,
      handleItemTypeSearchChange,
      handleItemCategoryScrollToBottom,
      handleItemCategorySearchChange,
    ]
  );

  return (
    <>
      <ListPageTemplate<ItemCatalogListItem>
        title={ITEM_CATALOG_LABELS.LIST.TITLE}
        headerActions={
          <div className="flex items-center gap-2">
            <Button onClick={handleAdd} leftIcon={<PlusIcon />}>
              {ITEM_CATALOG_LABELS.LIST.ADD_BUTTON}
            </Button>

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
                  {ITEM_CATALOG_LABELS.LIST.BUTTONS.DOWNLOAD_TEMPLATE}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isImporting}
                >
                  <Upload className="h-4 w-4" />
                  {ITEM_CATALOG_LABELS.LIST.BUTTONS.IMPORT}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        }
        data={itemCatalogs}
        columns={columns}
        isLoading={isLoading}
        isError={isError}
        emptyMessage={ITEM_CATALOG_LABELS.LIST.EMPTY}
        search={queryParams.search}
        onSearchChange={handleSearchChange}
        toolbarRight={filters}
        sortBy={params.sortBy}
        sortOrder={params.sortOrder}
        onSort={handleSort}
        page={params.page}
        perPage={params.perPage}
        totalItems={totalItems}
        totalPages={totalPages}
        onPaginationChange={handlePaginationChange}
      />

      <ItemCatalogDetailDrawer
        open={detailTarget !== null}
        onClose={handleDetailClose}
        onEdit={handleDetailEdit}
        id={detailTarget}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        variant="danger"
        title={ITEM_CATALOG_LABELS.DIALOG.DELETE_TITLE}
        description={ITEM_CATALOG_LABELS.DIALOG.DELETE_DESCRIPTION}
        cancelText={ITEM_CATALOG_LABELS.DIALOG.CANCEL}
        confirmText={ITEM_CATALOG_LABELS.DIALOG.CONFIRM_DELETE}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
      />
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
    </>
  );
}
