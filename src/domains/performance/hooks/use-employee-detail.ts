'use client';

import { useQuery } from '@tanstack/react-query';
import { type GetEmployeeDetailParams, getEmployeeDetail } from '../api/get-employee-detail';
import type { PerformanceDetail } from '../types';
import { PERFORMANCE_QUERY_KEYS } from './use-performance-employees';

export function useEmployeeDetail(
  employeeId: string,
  params?: GetEmployeeDetailParams,
  options?: { enabled?: boolean }
) {
  return useQuery<PerformanceDetail>({
    queryKey: PERFORMANCE_QUERY_KEYS.employee(employeeId, params),
    queryFn: () => getEmployeeDetail(employeeId, params),
    enabled: !!employeeId && (options?.enabled ?? true),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
