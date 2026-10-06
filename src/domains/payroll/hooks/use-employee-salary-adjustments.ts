'use client';

import { type UseQueryResult, useQuery } from '@tanstack/react-query';
import type { ApiPaginatedResponse } from '@/shared/types/api';
import { getEmployeeSalaryAdjustments } from '../api/get-employee-salary-adjustments';
import type { EmployeeSalaryAdjustment } from '../types';
import { PAYROLL_QUERY_KEYS } from './query-keys';

export function useEmployeeSalaryAdjustments(
  params: Record<string, unknown>,
  companyId?: string | null
): UseQueryResult<ApiPaginatedResponse<EmployeeSalaryAdjustment[]>> {
  return useQuery({
    queryKey: [...PAYROLL_QUERY_KEYS.employeeSalaryAdjustments, params, companyId],
    queryFn: () =>
      getEmployeeSalaryAdjustments({
        ...(params as any),
        companyId,
      }),
    enabled: !!companyId,
  });
}
