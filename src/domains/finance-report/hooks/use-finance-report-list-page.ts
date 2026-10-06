'use client';

import { useCallback } from 'react';
import type { GetFinanceReportsParams } from '../api/get-finance-reports';
import { useFinanceReports } from './use-finance-reports';

export interface UseFinanceReportListPageOptions {
  params: GetFinanceReportsParams;
  onSetQueryParams?: (params: Record<string, string | number | undefined>) => void;
}

export function useFinanceReportListPage(options: UseFinanceReportListPageOptions) {
  const { data, isLoading, isError } = useFinanceReports(options.params);

  const handleSearchChange = useCallback(
    (value: string | undefined) => options.onSetQueryParams?.({ search: value, page: 1 }),
    [options]
  );

  const handleSort = useCallback(
    (sortBy: string, sortOrder: 'asc' | 'desc') =>
      options.onSetQueryParams?.({ sortBy, sortOrder }),
    [options]
  );

  const handlePaginationChange = useCallback(
    (page: number, perPage: number) => options.onSetQueryParams?.({ page, perPage }),
    [options]
  );

  return {
    summary: data?.data.summary ?? { totalCashIn: 0, totalCashOut: 0, netBalance: 0 },
    items: data?.data.items ?? [],
    totalItems: data?.meta.total ?? 0,
    totalPages: data?.meta.lastPage ?? 1,
    isLoading,
    isError,
    handleSearchChange,
    handleSort,
    handlePaginationChange,
  };
}
