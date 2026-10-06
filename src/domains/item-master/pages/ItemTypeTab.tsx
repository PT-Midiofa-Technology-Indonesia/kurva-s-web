'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';
import { useQueryParams } from '@/hooks/use-query-params';
import { AsyncSelect } from '@/shared/components/atoms';
import { ListPageTemplate } from '@/shared/components/templates/ListPageTemplate';
import { Badge } from '@/shared/components/ui';
import type { BaseQueryParams } from '@/types/query-params';
import { ITEM_TYPE_LABELS, STATUS_OPTIONS } from '../constants';
import { useItemTypeTabPage } from '../hooks/use-item-type-tab-page';
import type { ItemType } from '../types';

export interface ItemTypeTabUrlParams extends BaseQueryParams {
  tab?: string;
  isActive?: string;
}

export function ItemTypeTab() {
  const { queryParams, updateQueryParam, setQueryParams } = useQueryParams<ItemTypeTabUrlParams>();

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
    itemTypes,
    totalItems,
    totalPages,
    isLoading,
    isError,
    handleSearchChange,
    handleIsActiveChange,
    handleSort,
    handlePaginationChange,
  } = useItemTypeTabPage(pageOptions);

  const columns = useMemo<ColumnDef<ItemType>[]>(
    () => [
      {
        accessorKey: 'code',
        header: ITEM_TYPE_LABELS.LIST.COLUMNS.CODE,
        size: 100,
      },
      {
        accessorKey: 'name',
        header: ITEM_TYPE_LABELS.LIST.COLUMNS.NAME,
        size: 300,
      },
      {
        accessorKey: 'status',
        header: ITEM_TYPE_LABELS.LIST.COLUMNS.STATUS,
        cell: ({ row }) =>
          row.original.isActive ? (
            <Badge variant="success">{ITEM_TYPE_LABELS.LIST.STATUS.ACTIVE}</Badge>
          ) : (
            <Badge variant="destructive">{ITEM_TYPE_LABELS.LIST.STATUS.INACTIVE}</Badge>
          ),
      },
    ],
    []
  );

  const filters = useMemo(
    () => (
      <AsyncSelect
        className="w-48 focus:ring-1 ring-primary"
        options={STATUS_OPTIONS}
        placeholder={ITEM_TYPE_LABELS.LIST.FILTERS.STATUS}
        isSearchable={false}
        onChange={handleIsActiveChange}
        isClearable
      />
    ),
    [handleIsActiveChange]
  );

  return (
    <ListPageTemplate<ItemType>
      title={ITEM_TYPE_LABELS.LIST.TITLE}
      data={itemTypes}
      columns={columns}
      isLoading={isLoading}
      isError={isError}
      emptyMessage={ITEM_TYPE_LABELS.LIST.EMPTY}
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
  );
}
