'use client';

import { useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import type { GetTaxReportsParams } from '../api/get-tax-reports';
import { useTaxReports } from './use-tax-reports';

export interface UseTaxReportPageOptions {
  params?: GetTaxReportsParams;
  onUpdateQueryParam?: (key: string, value: string | undefined) => void;
  onSetQueryParams?: (params: Record<string, string | number | undefined>) => void;
}

export function useTaxReportPage(options?: UseTaxReportPageOptions) {
  const searchParams = useSearchParams();
  const { data, isLoading, isError } = useTaxReports(options?.params);

  const handleViewDetail = useCallback(
    (id: string) => {
      const companyId = searchParams.get('companyId');
      const query = companyId ? `?companyId=${companyId}` : '';
      window.location.href = `/finance/tax-report/${id}${query}`;
    },
    [searchParams]
  );
  const handleSearchChange = useCallback(
    (value: string | undefined) => options?.onSetQueryParams?.({ search: value, page: 1 }),
    [options]
  );
  const handleSourceChange = useCallback(
    (value: string | string[] | null | undefined) => {
      options?.onSetQueryParams?.({
        source: Array.isArray(value) ? value[0] : value || undefined,
        page: 1,
      });
    },
    [options]
  );
  const handleTaxTypeChange = useCallback(
    (value: string | string[] | null | undefined) => {
      options?.onSetQueryParams?.({
        taxTypeId: Array.isArray(value) ? value[0] : value || undefined,
        page: 1,
      });
    },
    [options]
  );
  const handleStatusChange = useCallback(
    (value: string | string[] | null | undefined) => {
      options?.onSetQueryParams?.({
        status: Array.isArray(value) ? value[0] : value || undefined,
        page: 1,
      });
    },
    [options]
  );
  const handleSort = useCallback(
    (sortBy: string, sortOrder: 'asc' | 'desc') =>
      options?.onSetQueryParams?.({ sortBy, sortOrder }),
    [options]
  );
  const handlePaginationChange = useCallback(
    (page: number, perPage: number) => options?.onSetQueryParams?.({ page, perPage }),
    [options]
  );

  return {
    taxReports: data?.data ?? [],
    totalItems: data?.meta?.total,
    totalPages: data?.meta?.lastPage,
    isLoading,
    isError,
    handleViewDetail,
    handleSearchChange,
    handleSourceChange,
    handleTaxTypeChange,
    handleStatusChange,
    handleSort,
    handlePaginationChange,
  };
}
