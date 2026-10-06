import { useQuery } from '@tanstack/react-query';
import {
  type GetEmployeeWorkplacesParams,
  getEmployeeWorkplaces,
} from '../api/get-employee-workplaces';

export const EMPLOYEE_WORKPLACE_QUERY_KEYS = {
  all: ['employee-workplaces'] as const,
  lists: () => [...EMPLOYEE_WORKPLACE_QUERY_KEYS.all, 'list'] as const,
  list: (employeeId: string, params?: string) =>
    [...EMPLOYEE_WORKPLACE_QUERY_KEYS.lists(), employeeId, params] as const,
  details: () => [...EMPLOYEE_WORKPLACE_QUERY_KEYS.all, 'detail'] as const,
  detail: (employeeId: string, workplaceId: string) =>
    [...EMPLOYEE_WORKPLACE_QUERY_KEYS.details(), employeeId, workplaceId] as const,
};

export function useEmployeeWorkplaces(employeeId: string, params?: GetEmployeeWorkplacesParams) {
  return useQuery({
    queryKey: EMPLOYEE_WORKPLACE_QUERY_KEYS.list(employeeId, JSON.stringify(params)),
    queryFn: () => getEmployeeWorkplaces(employeeId, params),
    enabled: !!employeeId,
  });
}
