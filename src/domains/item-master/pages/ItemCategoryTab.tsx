'use client';

import type { ColumnDef, Row } from '@tanstack/react-table';
import { EllipsisVertical, Eye, Pencil, PlusIcon, Trash2 } from 'lucide-react';
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
import { ItemCategoryDetailDrawer } from '../components/ItemCategoryDetailDrawer';
import { ITEM_CATEGORY_LABELS, STATUS_OPTIONS } from '../constants';
import { useItemCategoryTabPage } from '../hooks/use-item-category-tab-page';
import { useItemTypesInfinite } from '../hooks/use-item-types-infinite';
import type { ItemCategoryListItem } from '../types';

interface ItemCategoryTabUrlParams extends BaseQueryParams {
  tab?: string;
  isActive?: string;
}

function ItemCategoryActionsCell({
  row,
  onDetail,
  onEdit,
  onDeleteClick,
}: {
  row: Row<ItemCategoryListItem>;
  onDetail: (item: ItemCategoryListItem) => void;
  onEdit: (item: ItemCategoryListItem) => void;
  onDeleteClick: (item: ItemCategoryListItem) => void;
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
          {ITEM_CATEGORY_LABELS.LIST.ACTIONS.EDIT}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onDetail(row.original)}>
          <Eye className="mr-2 h-4 w-4" />
          {ITEM_CATEGORY_LABELS.LIST.ACTIONS.DETAIL}
        </DropdownMenuItem>
        <Separator className="flex-1 h-[0.05rem]" />
        <DropdownMenuItem
          onClick={() => onDeleteClick(row.original)}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          {ITEM_CATEGORY_LABELS.LIST.ACTIONS.DELETE}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function ItemCategoryTab() {
  const { queryParams, updateQueryParam, setQueryParams } =
    useQueryParams<ItemCategoryTabUrlParams>();

  const [itemTypeSearch, setItemTypeSearch] = useState('');
  const debouncedItemTypeSearch = useDebounce(itemTypeSearch, 300);

  const {
    options: itemTypeOptions,
    hasMore: hasMoreItemTypes,
    isFetchingNextPage: isFetchingMoreItemTypes,
    loadMore: loadMoreItemTypes,
  } = useItemTypesInfinite({ search: debouncedItemTypeSearch });

  const handleItemTypeSearchChange = useCallback((v: string) => setItemTypeSearch(v), []);
  const handleItemTypeScrollToBottom = useCallback(() => {
    if (hasMoreItemTypes && !isFetchingMoreItemTypes) loadMoreItemTypes();
  }, [hasMoreItemTypes, isFetchingMoreItemTypes, loadMoreItemTypes]);

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
    itemCategories,
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
    handleSort,
    handlePaginationChange,
  } = useItemCategoryTabPage(pageOptions);

  void ItemCategoryActionsCell;
  void PlusIcon;
  void handleAdd;
  void handleEdit;
  void handleDetail;
  void handleDeleteClick;

  const columns = useMemo<ColumnDef<ItemCategoryListItem>[]>(
    () => [
      {
        accessorKey: 'code',
        header: ITEM_CATEGORY_LABELS.LIST.COLUMNS.CODE,
        size: 120,
      },
      {
        accessorKey: 'name',
        header: ITEM_CATEGORY_LABELS.LIST.COLUMNS.NAME,
        size: 280,
      },
      {
        id: 'itemType',
        header: ITEM_CATEGORY_LABELS.LIST.COLUMNS.ITEM_TYPE,
        size: 160,
        cell: ({ row }) => <Badge variant="secondary">{row.original.itemType?.name ?? '-'}</Badge>,
      },
      {
        accessorKey: 'status',
        header: ITEM_CATEGORY_LABELS.LIST.COLUMNS.STATUS,
        size: 100,
        cell: ({ row }) =>
          row.original.isActive ? (
            <Badge variant="success">{ITEM_CATEGORY_LABELS.LIST.STATUS.ACTIVE}</Badge>
          ) : (
            <Badge variant="destructive">{ITEM_CATEGORY_LABELS.LIST.STATUS.INACTIVE}</Badge>
          ),
      },
      {
        id: 'actions',
        header: ITEM_CATEGORY_LABELS.LIST.COLUMNS.ACTIONS,
        enableSorting: false,
        enableHiding: false,
        size: 60,
        cell: ({ row }) => (
          <ItemCategoryActionsCell
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
          placeholder={ITEM_CATEGORY_LABELS.LIST.FILTERS.ITEM_TYPE}
          isSearchable
          onChange={handleItemTypeChange}
          isClearable
          onScrollToBottom={handleItemTypeScrollToBottom}
          onSearchChange={handleItemTypeSearchChange}
        />
        <AsyncSelect
          className="w-48 focus:ring-1 ring-primary"
          options={STATUS_OPTIONS}
          placeholder={ITEM_CATEGORY_LABELS.LIST.FILTERS.STATUS}
          isSearchable={false}
          onChange={handleIsActiveChange}
          isClearable
        />
      </div>
    ),
    [
      handleIsActiveChange,
      handleItemTypeChange,
      itemTypeOptions,
      handleItemTypeScrollToBottom,
      handleItemTypeSearchChange,
    ]
  );

  return (
    <>
      <ListPageTemplate<ItemCategoryListItem>
        title={ITEM_CATEGORY_LABELS.LIST.TITLE}
        headerActions={
          <Button onClick={handleAdd} leftIcon={<PlusIcon />}>
            {ITEM_CATEGORY_LABELS.LIST.ADD_BUTTON}
          </Button>
        }
        data={itemCategories}
        columns={columns}
        isLoading={isLoading}
        isError={isError}
        emptyMessage={ITEM_CATEGORY_LABELS.LIST.EMPTY}
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

      <ItemCategoryDetailDrawer
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
        title={ITEM_CATEGORY_LABELS.DIALOG.DELETE_TITLE}
        description={ITEM_CATEGORY_LABELS.DIALOG.DELETE_DESCRIPTION}
        cancelText={ITEM_CATEGORY_LABELS.DIALOG.CANCEL}
        confirmText={ITEM_CATEGORY_LABELS.DIALOG.CONFIRM_DELETE}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
      />
    </>
  );
}
