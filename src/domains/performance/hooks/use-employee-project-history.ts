'use client';

import { useQuery } from '@tanstack/react-query';
import { getEmployeeProjectHistory } from '../api/get-employee-project-history';
import { PERFORMANCE_QUERY_KEYS } from './use-performance-employees';

export function useEmployeeProjectHistory(
  employeeId: string,
  params?: { companyId?: string },
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: PERFORMANCE_QUERY_KEYS.employeeProjectHistory(employeeId, params),
    queryFn: () => getEmployeeProjectHistory(employeeId, params?.companyId),
    enabled: !!employeeId && (options?.enabled ?? true),
    staleTime: 5 * 60 * 1000, // 5 minutes (project history changes less frequently)
  });
}
