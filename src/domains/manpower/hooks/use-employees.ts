import { useQuery } from '@tanstack/react-query';
import { type GetEmployeesParams, getEmployees } from '../api/get-employees';

export const EMPLOYEE_QUERY_KEYS = {
  all: ['employees'] as const,
  lists: () => [...EMPLOYEE_QUERY_KEYS.all, 'list'] as const,
  list: (filters: string) => [...EMPLOYEE_QUERY_KEYS.lists(), { filters }] as const,
  details: () => [...EMPLOYEE_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...EMPLOYEE_QUERY_KEYS.details(), id] as const,
};

export function useEmployees(params?: GetEmployeesParams) {
  return useQuery({
    queryKey: [...EMPLOYEE_QUERY_KEYS.all, params],
    queryFn: () => getEmployees(params),
    placeholderData: (previousData) => previousData,
  });
}
