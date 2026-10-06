'use client';

import { useSalaryStructureGrades } from './use-salary-structure-grades';

interface PageOptions {
  params: Record<string, unknown>;
}

export function useSalaryStructurePage({ params }: PageOptions) {
  const { data, isLoading, isError } = useSalaryStructureGrades(params);

  return {
    grades: data?.data ?? [],
    totalItems: data?.meta?.total ?? 0,
    totalPages: data?.meta?.lastPage ?? 0,
    isLoading,
    isError,
  };
}
