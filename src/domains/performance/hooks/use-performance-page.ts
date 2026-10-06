'use client';

import { useMemo } from 'react';
import { useCompanyFilter } from '@/shared/hooks/use-company-filter';
import { useQueryParams } from '@/shared/hooks/use-query-params';

import type { BaseQueryParams } from '@/shared/types/query-params';
import type { GetPerformanceEmployeesParams } from '../api/get-performance-employees';
import { usePerformanceEmployees } from './use-performance-employees';

export interface PerformancePageParams extends BaseQueryParams {
  month?: number;
  year?: number;
  gradeId?: string;
  companyId?: string;
}

export function usePerformancePage() {
  const { queryParams, updateQueryParam, setQueryParams } = useQueryParams<PerformancePageParams>();
  const { companyId, companyOptions, handleCompanyChange } = useCompanyFilter();

  const apiParams: GetPerformanceEmployeesParams = useMemo(
    () => ({
      page: queryParams.page,
      perPage: queryParams.perPage,
      search: queryParams.search,
      gradeId: queryParams.gradeId,
      sortBy: queryParams.sortBy,
      sortOrder: queryParams.sortOrder,
      month:
        queryParams.month ??
        (queryParams.year === undefined ? new Date().getMonth() + 1 : undefined),
      year: queryParams.year ?? new Date().getFullYear(),
      companyId,
    }),
    [queryParams, companyId]
  );

  const { data, isLoading, error } = usePerformanceEmployees(apiParams);

  return {
    data,
    isLoading,
    error,
    params: queryParams,
    companyId,
    companyOptions,
    handleCompanyChange,
    updateQueryParam,
    setQueryParams,
  };
}
