'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';
import { ListPageTemplate } from '@/components/templates/ListPageTemplate';
import { useQueryParams } from '@/hooks/use-query-params';
import type { BaseQueryParams } from '@/types/query-params';
import { formatCurrencyIDR } from '@/utils/format';
import { PROSPECT_FEE_LABELS } from '../constants';
import { useProspectFees } from '../hooks';
import type { FeeRow } from '../types';

interface FeeListUrlParams extends BaseQueryParams {
  tab?: string;
}

export interface FeeListContentProps {
  selectedCompanyId: string;
}

const labels = PROSPECT_FEE_LABELS.FEE_LIST;

export function FeeListContent({ selectedCompanyId }: FeeListContentProps) {
  const { queryParams, setQueryParams } = useQueryParams<FeeListUrlParams>();
  const page = queryParams.page ?? 1;
  const perPage = queryParams.perPage ?? 10;
  const search = queryParams.search;
  const sortBy = queryParams.sortBy as GetProspectFeeSortField | undefined;
  const sortOrder = (queryParams.sortOrder as 'asc' | 'desc' | undefined) ?? 'asc';

  const { data, isLoading } = useProspectFees({
    companyId: selectedCompanyId || undefined,
    page,
    perPage,
    search,
    sortBy,
    sortOrder,
  });
  const feeRows = data?.data ?? [];
  const totalItems = data?.meta.total ?? 0;
  const totalPages = data?.meta.lastPage ?? 1;

  const columns = useMemo<ColumnDef<FeeRow>[]>(
    () => [
      { accessorKey: 'project', header: labels.COLUMNS.PROJECT },
      { accessorKey: 'companyName', header: labels.COLUMNS.COMPANY },
      { accessorKey: 'projectCapability', header: labels.COLUMNS.PROJECT_CAPABILITY },
      {
        accessorKey: 'projectValue',
        header: labels.COLUMNS.PROJECT_VALUE,
        cell: ({ row }) => formatCurrencyIDR(row.original.projectValue),
      },
      {
        accessorKey: 'fee',
        header: labels.COLUMNS.FEE,
        cell: ({ row }) => formatCurrencyIDR(row.original.fee),
      },
      { accessorKey: 'note', header: labels.COLUMNS.NOTE },
    ],
    []
  );

  return (
    <ListPageTemplate<FeeRow>
      title={labels.TITLE}
      data={feeRows}
      columns={columns}
      emptyMessage={labels.EMPTY}
      search={search}
      searchPlaceholder={labels.SEARCH_PLACEHOLDER}
      onSearchChange={(v) => setQueryParams({ search: v, page: 1 })}
      page={page}
      perPage={perPage}
      pageSizeOptions={[5, 10, 20, 50]}
      totalItems={totalItems}
      totalPages={totalPages}
      onPaginationChange={(p, pp) => setQueryParams({ page: p, perPage: pp })}
      isLoading={isLoading}
    />
  );
}

type GetProspectFeeSortField =
  | 'projectName'
  | 'companyName'
  | 'projectCapability'
  | 'estimatedValue'
  | 'calculatedFee'
  | 'note';
