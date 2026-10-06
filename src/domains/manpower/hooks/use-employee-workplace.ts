'use client';

import { useQuery } from '@tanstack/react-query';

import { getEmployeeWorkplace } from '../api/get-employee-workplace';
import { EMPLOYEE_WORKPLACE_QUERY_KEYS } from './use-employee-workplaces';

export function useEmployeeWorkplace(employeeId: string, workplaceId: string) {
  return useQuery({
    queryKey: EMPLOYEE_WORKPLACE_QUERY_KEYS.detail(employeeId, workplaceId),
    queryFn: () => getEmployeeWorkplace(employeeId, workplaceId),
    enabled: !!employeeId && !!workplaceId,
    select: (data) => (data ? data.data : null),
  });
}
