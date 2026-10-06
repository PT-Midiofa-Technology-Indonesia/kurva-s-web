import { useQuery } from '@tanstack/react-query';
import { type GetDepartmentsParams, getDepartments } from '../api/get-departments';

export const DEPARTMENT_QUERY_KEYS = {
  all: ['departments'] as const,
  lists: () => [...DEPARTMENT_QUERY_KEYS.all, 'list'] as const,
  list: (filters: string) => [...DEPARTMENT_QUERY_KEYS.lists(), { filters }] as const,
  details: () => [...DEPARTMENT_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...DEPARTMENT_QUERY_KEYS.details(), id] as const,
  infinite: () => ['departments-infinite'] as const,
};

export function useDepartments(params?: GetDepartmentsParams) {
  return useQuery({
    queryKey: [...DEPARTMENT_QUERY_KEYS.all, params],
    queryFn: () => getDepartments(params),
    placeholderData: (previousData) => previousData,
  });
}
