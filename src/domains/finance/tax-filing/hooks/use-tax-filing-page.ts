'use client';

import { useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import type { GetTaxFilingsParams } from '../api/get-tax-filings';
import { useTaxFilings } from './use-tax-filings';

interface Options {
  params?: GetTaxFilingsParams;
  onSetQueryParams?: (params: Record<string, string | number | boolean | undefined>) => void;
}
export function useTaxFilingPage(options?: Options) {
  const searchParams = useSearchParams();
  const { data, isLoading, isError } = useTaxFilings(options?.params);
  const handleViewDetail = useCallback(
    (id: string) => {
      const companyId = searchParams.get('companyId');
      const query = companyId ? `?companyId=${companyId}` : '';
      window.location.href = `/finance/tax-filing/${id}${query}`;
    },
    [searchParams]
  );
  return {
    taxFilings: data?.data ?? [],
    totalItems: data?.meta?.total ?? 0,
    totalPages: data?.meta?.lastPage ?? 1,
    isLoading,
    isError,
    handleViewDetail,
    handleSearchChange: (value: string | undefined) =>
      options?.onSetQueryParams?.({ search: value, page: 1 }),
    handleStatusChange: (value: string | null | undefined) =>
      options?.onSetQueryParams?.({ status: value ?? undefined, page: 1 }),
    handleTaxPeriodChange: (value: string | undefined) =>
      options?.onSetQueryParams?.({ taxPeriod: value, page: 1 }),
    handleTaxTypeChange: (value: string | null | undefined) =>
      options?.onSetQueryParams?.({ taxTypeId: value ?? undefined, page: 1 }),
    handleSort: (sortBy: string, sortOrder: 'asc' | 'desc') =>
      options?.onSetQueryParams?.({ sortBy, sortOrder }),
    handlePaginationChange: (page: number, perPage: number) =>
      options?.onSetQueryParams?.({ page, perPage }),
  };
}
