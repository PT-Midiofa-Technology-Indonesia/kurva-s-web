'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';
import { useQueryParams } from '@/hooks/use-query-params';
import { AsyncSelect } from '@/shared/components/atoms';
import { ListPageTemplate } from '@/shared/components/templates/ListPageTemplate';
import { Badge } from '@/shared/components/ui';
import type { BaseQueryParams } from '@/shared/types/query-params';
import { DEPARTMENT_LABELS, STATUS_OPTIONS } from '../constants';
import { useDepartmentPage } from '../hooks/use-department-page';
import type { Department } from '../types';

interface DepartmentUrlParams extends BaseQueryParams {
  isActive?: string;
}

export function DepartmentListPage() {
  const { queryParams, updateQueryParam, setQueryParams } = useQueryParams<DepartmentUrlParams>();

  const params = useMemo(() => {
    const isActive =
      queryParams.isActive === 'true' ? true : queryParams.isActive === 'false' ? false : undefined;

    return {
      page: queryParams.page ?? 1,
      perPage: queryParams.perPage ?? 10,
      sortBy: ['code', 'name', 'isActive'].includes(queryParams.sortBy ?? '')
        ? queryParams.sortBy
        : 'name',
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
    departments,
    totalItems,
    totalPages,
    isLoading,
    isError,
    handleIsActiveChange,
    handleSearchChange,
    handleSort,
    handlePaginationChange,
  } = useDepartmentPage(pageOptions);

  const columns = useMemo<ColumnDef<Department>[]>(
    () => [
      {
        accessorKey: 'code',
        header: DEPARTMENT_LABELS.LIST.COLUMNS.CODE,
        size: 100,
      },
      {
        accessorKey: 'name',
        header: DEPARTMENT_LABELS.LIST.COLUMNS.NAME,
        size: 200,
      },
      {
        accessorKey: 'status',
        header: DEPARTMENT_LABELS.LIST.COLUMNS.STATUS,
        cell: ({ row }) =>
          row.original.isActive ? (
            <Badge variant="success">{DEPARTMENT_LABELS.LIST.STATUS.ACTIVE}</Badge>
          ) : (
            <Badge variant="destructive">{DEPARTMENT_LABELS.LIST.STATUS.INACTIVE}</Badge>
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
        placeholder={DEPARTMENT_LABELS.LIST.FILTERS.STATUS}
        isSearchable={false}
        onChange={handleIsActiveChange}
        isClearable
      />
    ),
    [handleIsActiveChange]
  );

  return (
    <ListPageTemplate<Department>
      title={DEPARTMENT_LABELS.LIST.TITLE}
      data={departments}
      columns={columns}
      isLoading={isLoading}
      isError={isError}
      emptyMessage={DEPARTMENT_LABELS.LIST.EMPTY}
      search={queryParams.search}
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
