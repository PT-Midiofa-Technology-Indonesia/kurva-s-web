'use client';

import { useQuery } from '@tanstack/react-query';
import { type GetEmployeeHistoryParams, getEmployeeHistory } from '../api/get-employee-history';
import type { GetEmployeeHistoryResponse } from '../types';
import { PERFORMANCE_QUERY_KEYS } from './use-performance-employees';

export function useEmployeeHistory(
  employeeId: string,
  params?: GetEmployeeHistoryParams,
  options?: { enabled?: boolean }
) {
  return useQuery<GetEmployeeHistoryResponse>({
    queryKey: PERFORMANCE_QUERY_KEYS.employeeHistory(employeeId, params),
    queryFn: () => getEmployeeHistory(employeeId, params),
    enabled: !!employeeId && (options?.enabled ?? true),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
