'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { useCallback, useMemo } from 'react';
import { useQueryParams } from '@/hooks/use-query-params';
import { AsyncSelect } from '@/shared/components/atoms';
import { ListPageTemplate } from '@/shared/components/templates/ListPageTemplate';
import { Badge } from '@/shared/components/ui';
import { formatDate } from '@/shared/utils/format';
import type { BaseQueryParams } from '@/types/query-params';
import { VENDOR_DIRECTORY_LABELS, VENDOR_DIRECTORY_STATUS_OPTIONS } from '../constants';
import { useVendorOfferingDocuments } from '../hooks';
import type { VendorDirectoryOfferingDocument } from '../types';

interface OfferingDocumentUrlParams extends BaseQueryParams {
  isActive?: string;
  tab?: string;
}

export function VendorDirectoryOfferingDocumentList() {
  const { queryParams, updateQueryParam, setQueryParams } =
    useQueryParams<OfferingDocumentUrlParams>();

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

  const { data, isLoading, isError } = useVendorOfferingDocuments(params);
  const items = (data?.data ?? []) as unknown as VendorDirectoryOfferingDocument[];
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

  const columns = useMemo<ColumnDef<VendorDirectoryOfferingDocument>[]>(
    () => [
      {
        accessorKey: 'code',
        header: VENDOR_DIRECTORY_LABELS.OFFERING_DOCUMENT.COLUMNS.CODE,
        size: 160,
        cell: ({ row }) => row.original.code ?? '-',
      },
      {
        accessorKey: 'title',
        header: VENDOR_DIRECTORY_LABELS.OFFERING_DOCUMENT.COLUMNS.TITLE,
        size: 240,
        cell: ({ row }) => row.original.title ?? '-',
      },
      {
        id: 'vendor',
        header: VENDOR_DIRECTORY_LABELS.OFFERING_DOCUMENT.COLUMNS.VENDOR,
        size: 220,
        enableSorting: false,
        cell: ({ row }) => row.original.vendor?.name ?? '-',
      },
      {
        accessorKey: 'period',
        header: VENDOR_DIRECTORY_LABELS.OFFERING_DOCUMENT.COLUMNS.PERIOD,
        size: 200,
        enableSorting: false,
        cell: ({ row }) =>
          `${formatDate(row.original.periodStart)} - ${formatDate(row.original.periodEnd)}`,
      },
      {
        id: 'status',
        header: VENDOR_DIRECTORY_LABELS.OFFERING_DOCUMENT.COLUMNS.STATUS,
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
    <ListPageTemplate<VendorDirectoryOfferingDocument>
      title={VENDOR_DIRECTORY_LABELS.OFFERING_DOCUMENT.TITLE}
      data={items}
      columns={columns}
      isLoading={isLoading}
      isError={isError}
      emptyMessage={VENDOR_DIRECTORY_LABELS.OFFERING_DOCUMENT.EMPTY}
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
