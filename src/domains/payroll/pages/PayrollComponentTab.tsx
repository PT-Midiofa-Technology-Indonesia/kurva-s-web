'use client';

import { type ColumnDef } from '@tanstack/react-table';
import { useCallback, useMemo } from 'react';
import { AsyncSelect } from '@/shared/components/atoms';
import { ListPageTemplate } from '@/shared/components/templates/ListPageTemplate';
import { Badge } from '@/shared/components/ui/badge';
import { useQueryParams } from '@/shared/hooks/use-query-params';
import type { BaseQueryParams } from '@/types/query-params';
import { CATEGORY_BADGE, CATEGORY_OPTIONS, CONFIGURABLE_BADGE, PAYROLL_LABELS } from '../constants';
import { usePayrollComponentPage } from '../hooks/use-payroll-page';
import { getPayrollValueBasis } from '../services/format-payroll-value';
import type { PayrollComponent } from '../types';

interface TabUrlParams extends BaseQueryParams {
  tab?: string;
  category?: string;
}

export function PayrollComponentTab() {
  const { queryParams, updateQueryParam, setQueryParams } = useQueryParams<TabUrlParams>();

  // Category filter
  const handleCategoryChange = useCallback(
    (value: unknown) => {
      const val = value as string | undefined;
      setQueryParams({ category: val || undefined, page: '1' } as any);
    },
    [setQueryParams]
  );

  const params = useMemo(
    () => ({
      page: queryParams.page ?? 1,
      perPage: queryParams.perPage ?? 10,
      sortBy: queryParams.sortBy ?? 'code',
      sortOrder: (queryParams.sortOrder || 'asc') as 'asc' | 'desc',
      search: queryParams.search,
      category: queryParams.category || undefined,
    }),
    [queryParams]
  );

  const pageOptions = useMemo(() => ({ params }), [params]);

  const { components, totalItems, totalPages, isLoading, isError } =
    usePayrollComponentPage(pageOptions);

  // ── Handlers (own useQueryParams, not from hook) ──
  const handleSearchChange = useCallback(
    (value: string | undefined) => {
      setQueryParams({ search: value || undefined, page: '1' } as any);
    },
    [setQueryParams]
  );

  const handleSort = useCallback(
    (sortBy?: string, sortOrder?: string) => {
      if (sortBy) updateQueryParam('sortBy', sortBy);
      if (sortOrder) updateQueryParam('sortOrder', sortOrder);
    },
    [updateQueryParam]
  );

  const handlePaginationChange = useCallback(
    (page: number, perPage: number) => {
      setQueryParams({
        page: String(page),
        perPage: String(perPage),
      } as any);
    },
    [setQueryParams]
  );

  const columns = useMemo<ColumnDef<PayrollComponent>[]>(
    () => [
      {
        accessorKey: 'code',
        header: PAYROLL_LABELS.COMPONENT.COLUMNS.CODE,
        size: 120,
      },
      {
        accessorKey: 'category',
        header: PAYROLL_LABELS.COMPONENT.COLUMNS.CATEGORY,
        size: 120,
        cell: ({ row }) => {
          const badge = CATEGORY_BADGE[row.original.category];
          return badge ? (
            <Badge className={badge.className}>{badge.label}</Badge>
          ) : (
            <span>{row.original.categoryLabel || row.original.category}</span>
          );
        },
      },
      {
        accessorKey: 'name',
        header: PAYROLL_LABELS.COMPONENT.COLUMNS.NAME,
        size: 250,
      },
      {
        accessorKey: 'valueType',
        header: PAYROLL_LABELS.COMPONENT.COLUMNS.VALUE_TYPE,
        size: 170,
        enableSorting: false,
        cell: ({ row }) => {
          const { valueType, valueTypeLabel, baseScope, baseComponentName } = row.original;
          const basis = getPayrollValueBasis(valueType, baseScope, baseComponentName);
          return (
            <div className="flex flex-col">
              <span>{valueTypeLabel}</span>
              {basis && <span className="text-xs text-slate-500">{basis}</span>}
            </div>
          );
        },
      },
      {
        accessorKey: 'isConfigurable',
        header: PAYROLL_LABELS.COMPONENT.COLUMNS.IS_CONFIGURABLE,
        size: 130,
        enableSorting: false,
        cell: ({ row }) => {
          const badge = CONFIGURABLE_BADGE[row.original.isConfigurable ? 'true' : 'false'];
          return <Badge className={badge.className}>{badge.label}</Badge>;
        },
      },
      {
        accessorKey: 'description',
        header: PAYROLL_LABELS.COMPONENT.COLUMNS.DESCRIPTION,
        size: 300,
        cell: ({ row }) => row.original.description || '-',
      },
    ],
    []
  );

  const filters = useMemo(
    () => (
      <div className="flex gap-3">
        <AsyncSelect
          className="w-48 focus:ring-1 ring-primary"
          options={CATEGORY_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
          placeholder={PAYROLL_LABELS.FILTER.CATEGORY}
          isSearchable={false}
          onChange={handleCategoryChange}
          isClearable
        />
      </div>
    ),
    [handleCategoryChange]
  );

  return (
    <ListPageTemplate<PayrollComponent>
      title={PAYROLL_LABELS.COMPONENT.TITLE}
      data={components}
      columns={columns}
      isLoading={isLoading}
      isError={isError}
      emptyMessage={PAYROLL_LABELS.COMPONENT.EMPTY}
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
