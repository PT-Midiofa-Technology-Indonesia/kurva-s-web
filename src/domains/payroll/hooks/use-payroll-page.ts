'use client';

import { usePayrollComponents } from './use-payroll-components';

interface PageOptions {
  params: Record<string, unknown>;
}

export function usePayrollComponentPage({ params }: PageOptions) {
  const { data, isLoading, isError } = usePayrollComponents(params);

  return {
    components: data?.data ?? [],
    totalItems: data?.meta?.total ?? 0,
    totalPages: data?.meta?.lastPage ?? 0,
    isLoading,
    isError,
  };
}
