'use client';

import { type UseQueryResult, useQuery } from '@tanstack/react-query';
import type { ApiPaginatedResponse } from '@/shared/types/api';
import { getSalaryStructureGrades } from '../api/get-salary-structure-grades';
import type { SalaryStructureGrade } from '../types';
import { PAYROLL_QUERY_KEYS } from './query-keys';

export function useSalaryStructureGrades(
  params: Record<string, unknown>
): UseQueryResult<ApiPaginatedResponse<SalaryStructureGrade[]>> {
  return useQuery({
    queryKey: [...PAYROLL_QUERY_KEYS.salaryStructureGrades, params],
    queryFn: () => getSalaryStructureGrades(params as any),
  });
}
