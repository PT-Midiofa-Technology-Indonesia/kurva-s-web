'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { useCallback, useMemo } from 'react';
import { useQueryParams } from '@/hooks/use-query-params';
import { AsyncSelect } from '@/shared/components/atoms';
import { ListPageTemplate } from '@/shared/components/templates/ListPageTemplate';
import { Badge } from '@/shared/components/ui';
import type { BaseQueryParams } from '@/types/query-params';
import { VENDOR_DIRECTORY_LABELS, VENDOR_DIRECTORY_STATUS_OPTIONS } from '../constants';
import { useVendorCapabilities } from '../hooks';
import type { VendorDirectoryCapability } from '../types';

interface CapabilityUrlParams extends BaseQueryParams {
  isActive?: string;
  tab?: string;
}

export function VendorDirectoryCapabilityList() {
  const { queryParams, updateQueryParam, setQueryParams } = useQueryParams<CapabilityUrlParams>();

  const params = useMemo(() => {
    const isActive =
      queryParams.isActive === 'true' ? true : queryParams.isActive === 'false' ? false : undefined;

    return {
      page: queryParams.page ?? 1,
      perPage: queryParams.perPage ?? 10,
      sortBy: queryParams.sortBy ?? '',
      sortOrder: (queryParams.sortOrder || 'desc') as 'asc' | 'desc',
      search: queryParams.search,
      isActive,
    };
  }, [queryParams]);

  const { data, isLoading, isError } = useVendorCapabilities(params);
  const items = (data?.data ?? []) as unknown as VendorDirectoryCapability[];
  const totalItems = data?.meta?.total;
  const totalPages = data?.meta?.lastPage;

  const handleSearchChange = useCallback(
    (value: string | undefined) => {
      setQueryParams({ search: value, page: 1 });
    },
    [setQueryParams]
  );

  const handleIsActiveChange = useCallback(
    (value: string | string[] | null | undefined) => {
      const stringValue = Array.isArray(value) ? value[0] : value;
      if (stringValue === 'all' || !stringValue) {
        updateQueryParam('isActive', undefined);
      } else {
        updateQueryParam('isActive', stringValue);
      }
    },
    [updateQueryParam]
  );

  const handleSort = useCallback(
    (sortBy: string, sortOrder: 'asc' | 'desc') => {
      setQueryParams({ sortBy, sortOrder });
    },
    [setQueryParams]
  );

  const handlePaginationChange = useCallback(
    (page: number, perPage: number) => {
      setQueryParams({ page, perPage });
    },
    [setQueryParams]
  );

  const columns = useMemo<ColumnDef<VendorDirectoryCapability>[]>(
    () => [
      {
        accessorKey: 'code',
        header: VENDOR_DIRECTORY_LABELS.CAPABILITY.COLUMNS.CODE,
        size: 120,
        cell: ({ row }) => row.original.skillCatalog?.code ?? '-',
      },
      {
        accessorKey: 'name',
        header: VENDOR_DIRECTORY_LABELS.CAPABILITY.COLUMNS.NAME,
        size: 240,
        cell: ({ row }) => row.original.skillCatalog?.name ?? '-',
      },
      {
        id: 'vendor',
        header: VENDOR_DIRECTORY_LABELS.CAPABILITY.COLUMNS.VENDOR,
        size: 240,
        enableSorting: false,
        cell: ({ row }) => row.original.vendor?.name ?? '-',
      },
      {
        id: 'status',
        header: VENDOR_DIRECTORY_LABELS.CAPABILITY.COLUMNS.STATUS,
        size: 140,
        enableSorting: false,
        cell: ({ row }) =>
          row.original.isActive ? (
            <Badge variant="success">{VENDOR_DIRECTORY_LABELS.COMMON.STATUS_ACTIVE}</Badge>
          ) : (
            <Badge variant="destructive">{VENDOR_DIRECTORY_LABELS.COMMON.STATUS_INACTIVE}</Badge>
          ),
      },
    ],
    []
  );

  const filters = useMemo(
    () => (
      <AsyncSelect
        className="w-48 focus:ring-1 ring-primary"
        options={VENDOR_DIRECTORY_STATUS_OPTIONS}
        placeholder={VENDOR_DIRECTORY_LABELS.STATUS_FILTER_PLACEHOLDER}
        isSearchable={false}
        onChange={handleIsActiveChange}
        isClearable
      />
    ),
    [handleIsActiveChange]
  );

  return (
    <ListPageTemplate<VendorDirectoryCapability>
      title={VENDOR_DIRECTORY_LABELS.CAPABILITY.TITLE}
      data={items}
      columns={columns}
      isLoading={isLoading}
      isError={isError}
      emptyMessage={VENDOR_DIRECTORY_LABELS.CAPABILITY.EMPTY}
      search={queryParams.search}
      searchPlaceholder={VENDOR_DIRECTORY_LABELS.SEARCH_PLACEHOLDER}
      onSearchChange={handleSearchChange}
      sortBy={params.sortBy}
      sortOrder={params.sortOrder}
      onSort={handleSort}
      page={params.page}
      perPage={params.perPage}
      totalItems={totalItems}
      totalPages={totalPages}
      onPaginationChange={handlePaginationChange}
      toolbarRight={filters}
    />
  );
}
