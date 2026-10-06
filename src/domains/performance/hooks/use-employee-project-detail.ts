'use client';

import { useQuery } from '@tanstack/react-query';
import { getEmployeeProjectDetail } from '../api/get-employee-project-detail';
import { PERFORMANCE_QUERY_KEYS } from './use-performance-employees';

export function useEmployeeProjectDetail(
  employeeId: string,
  projectId: string,
  params?: { companyId?: string }
) {
  return useQuery({
    queryKey: [
      ...PERFORMANCE_QUERY_KEYS.all,
      'employee',
      employeeId,
      'project',
      projectId,
      params,
    ] as const,
    queryFn: () => getEmployeeProjectDetail(employeeId, projectId, params?.companyId),
    enabled: !!employeeId && !!projectId,
    staleTime: 5 * 60 * 1000,
  });
}
