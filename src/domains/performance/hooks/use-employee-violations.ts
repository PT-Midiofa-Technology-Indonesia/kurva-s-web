'use client';

import { useQuery } from '@tanstack/react-query';
import { getEmployeeViolations } from '../api/get-employee-violations';
import { PERFORMANCE_QUERY_KEYS } from './use-performance-employees';

export function useEmployeeViolations(
  employeeId: string,
  params?: { companyId?: string },
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: PERFORMANCE_QUERY_KEYS.employeeViolations(employeeId, params),
    queryFn: () => getEmployeeViolations(employeeId, params?.companyId),
    enabled: !!employeeId && (options?.enabled ?? true),
    staleTime: 5 * 60 * 1000,
  });
}
