import { useQuery } from '@tanstack/react-query';
import { type GetEmployeeGradesParams, getEmployeeGrades } from '../api/get-employee-grades';

export const EMPLOYEE_GRADE_QUERY_KEYS = {
  all: ['employee-grades'] as const,
  lists: () => [...EMPLOYEE_GRADE_QUERY_KEYS.all, 'list'] as const,
  list: (filters: string) => [...EMPLOYEE_GRADE_QUERY_KEYS.lists(), { filters }] as const,
  details: () => [...EMPLOYEE_GRADE_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...EMPLOYEE_GRADE_QUERY_KEYS.details(), id] as const,
  infinite: () => ['employee-grades-infinite'] as const,
};

export function useEmployeeGrades(params?: GetEmployeeGradesParams) {
  return useQuery({
    queryKey: [...EMPLOYEE_GRADE_QUERY_KEYS.all, params],
    queryFn: () => getEmployeeGrades(params),
    placeholderData: (previousData) => previousData,
  });
}
