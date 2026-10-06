'use client';

import { useQuery } from '@tanstack/react-query';
import { getEmployeeGrade } from '../api/get-employee-grade';
import { EMPLOYEE_GRADE_QUERY_KEYS } from './use-employee-grades';

export function useEmployeeGrade(employeeGradeId: string) {
  return useQuery({
    queryKey: EMPLOYEE_GRADE_QUERY_KEYS.detail(employeeGradeId),
    queryFn: () => getEmployeeGrade(employeeGradeId),
    enabled: !!employeeGradeId,
    select: (data) => (data ? data.data : null),
  });
}
