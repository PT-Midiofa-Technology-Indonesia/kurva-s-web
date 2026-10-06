'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';
import { useQueryParams } from '@/hooks/use-query-params';
import { AsyncSelect } from '@/shared/components/atoms';
import { ListPageTemplate } from '@/shared/components/templates/ListPageTemplate';
import { Badge } from '@/shared/components/ui';
import type { BaseQueryParams } from '@/types/query-params';
import { APPROVAL_GROUP_LABELS, STATUS_OPTIONS } from '../constants';
import { useApprovalGroupPage } from '../hooks/use-approval-group-page';
import type { ApprovalGroup } from '../types';

interface ApprovalGroupUrlParams extends BaseQueryParams {
  isActive?: string;
}

export function ApprovalGroupListPage() {
  const { queryParams, updateQueryParam, setQueryParams } =
    useQueryParams<ApprovalGroupUrlParams>();

  const params = useMemo(() => {
    const isActive =
      queryParams.isActive === 'true' ? true : queryParams.isActive === 'false' ? false : undefined;

    return {
      page: queryParams.page ?? 1,
      perPage: queryParams.perPage ?? 10,
      sortBy: queryParams.sortBy ?? 'code',
      sortOrder: (queryParams.sortOrder || 'asc') as 'asc' | 'desc',
      search: queryParams.search,
      isActive,
    };
  }, [queryParams]);

  const pageOptions = useMemo(
    () => ({
      params,
      onUpdateQueryParam: updateQueryParam,
      onSetQueryParams: setQueryParams,
    }),
    [params, updateQueryParam, setQueryParams]
  );

  const {
    approvalGroups,
    totalItems,
    totalPages,
    isLoading,
    isError,
    handleIsActiveChange,
    handleSearchChange,
    handleSort,
    handlePaginationChange,
  } = useApprovalGroupPage(pageOptions);

  const columns = useMemo<ColumnDef<ApprovalGroup>[]>(
    () => [
      {
        accessorKey: 'code',
        header: APPROVAL_GROUP_LABELS.LIST.COLUMNS.CODE,
        size: 150,
      },
      {
        accessorKey: 'name',
        header: APPROVAL_GROUP_LABELS.LIST.COLUMNS.NAME,
      },
      {
        accessorKey: 'status',
        header: APPROVAL_GROUP_LABELS.LIST.COLUMNS.STATUS,
        size: 120,
        cell: ({ row }) =>
          row.original.isActive ? (
            <Badge variant="success">{APPROVAL_GROUP_LABELS.LIST.STATUS.ACTIVE}</Badge>
          ) : (
            <Badge variant="destructive">{APPROVAL_GROUP_LABELS.LIST.STATUS.INACTIVE}</Badge>
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
        placeholder={APPROVAL_GROUP_LABELS.LIST.FILTERS.STATUS}
        isSearchable={false}
        onChange={handleIsActiveChange}
        isClearable
      />
    ),
    [handleIsActiveChange]
  );

  return (
    <ListPageTemplate<ApprovalGroup>
      title={APPROVAL_GROUP_LABELS.LIST.TITLE}
      data={approvalGroups}
      columns={columns}
      isLoading={isLoading}
      isError={isError}
      emptyMessage={APPROVAL_GROUP_LABELS.LIST.EMPTY}
      search={queryParams.search}
      searchPlaceholder={APPROVAL_GROUP_LABELS.LIST.SEARCH_PLACEHOLDER}
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
