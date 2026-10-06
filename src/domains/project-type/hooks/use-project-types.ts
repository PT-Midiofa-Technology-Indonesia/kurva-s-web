import { useQuery } from '@tanstack/react-query';
import { type GetProjectTypesParams, getProjectTypes } from '../api/get-project-types';

export const PROJECT_TYPE_QUERY_KEYS = {
  all: ['project-types'] as const,
  lists: () => [...PROJECT_TYPE_QUERY_KEYS.all, 'list'] as const,
  list: (filters: string) => [...PROJECT_TYPE_QUERY_KEYS.lists(), { filters }] as const,
  details: () => [...PROJECT_TYPE_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...PROJECT_TYPE_QUERY_KEYS.details(), id] as const,
};

export function useProjectTypes(params?: GetProjectTypesParams) {
  return useQuery({
    queryKey: [...PROJECT_TYPE_QUERY_KEYS.all, params],
    queryFn: () => getProjectTypes(params),
    placeholderData: (previousData) => previousData,
  });
}
