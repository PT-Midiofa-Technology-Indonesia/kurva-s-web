'use client';

import { useEmployeeSalaryAdjustments } from './use-employee-salary-adjustments';

interface PageOptions {
  params: Record<string, unknown>;
  companyId?: string;
}

export function useEmployeeSalaryAdjustmentPage({ params, companyId }: PageOptions) {
  const { data, isLoading, isError } = useEmployeeSalaryAdjustments(params, companyId);

  return {
    employees: data?.data ?? [],
    totalItems: data?.meta?.total ?? 0,
    totalPages: data?.meta?.lastPage ?? 0,
    isLoading,
    isError,
  };
}
