import { useQuery } from '@tanstack/react-query';
import {
  type GetProjectCapabilitiesParams,
  getProjectCapabilities,
} from '../api/get-project-capabilities';

export const PROJECT_CAPABILITY_QUERY_KEYS = {
  all: ['project-capabilities'] as const,
  lists: () => [...PROJECT_CAPABILITY_QUERY_KEYS.all, 'list'] as const,
  list: (filters: string) => [...PROJECT_CAPABILITY_QUERY_KEYS.lists(), { filters }] as const,
  details: () => [...PROJECT_CAPABILITY_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...PROJECT_CAPABILITY_QUERY_KEYS.details(), id] as const,
  infinite: () => ['project-capabilities-infinite'] as const,
};

export function useProjectCapabilities(params?: GetProjectCapabilitiesParams) {
  return useQuery({
    queryKey: [...PROJECT_CAPABILITY_QUERY_KEYS.all, params],
    queryFn: () => getProjectCapabilities(params),
    placeholderData: (previousData) => previousData,
  });
}
