'use client';

import { useQuery } from '@tanstack/react-query';
import { getEmployeePositionAssignments } from '../api/get-employee-position-assignments';

export const EMPLOYEE_POSITION_ASSIGNMENT_QUERY_KEYS = {
  all: ['employee-position-assignments'] as const,
  byEmployee: (id: string) => [...EMPLOYEE_POSITION_ASSIGNMENT_QUERY_KEYS.all, id] as const,
};

export function useEmployeePositionAssignments(employeeId: string, companyId?: string) {
  return useQuery({
    queryKey: EMPLOYEE_POSITION_ASSIGNMENT_QUERY_KEYS.byEmployee(employeeId),
    queryFn: () => getEmployeePositionAssignments(employeeId, companyId),
    enabled: !!employeeId,
    select: (data) => data?.data ?? [],
  });
}
