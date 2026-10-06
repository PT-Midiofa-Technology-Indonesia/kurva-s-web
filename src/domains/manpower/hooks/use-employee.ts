'use client';

import { useQuery } from '@tanstack/react-query';

import { getEmployee } from '../api/get-employee';
import { EMPLOYEE_QUERY_KEYS } from './use-employees';

export function useEmployee(employeeId: string, companyId?: string) {
  return useQuery({
    queryKey: EMPLOYEE_QUERY_KEYS.detail(employeeId),
    queryFn: () => getEmployee(employeeId, companyId),
    enabled: !!employeeId,
    select: (data) => (data ? data.data : null),
  });
}
