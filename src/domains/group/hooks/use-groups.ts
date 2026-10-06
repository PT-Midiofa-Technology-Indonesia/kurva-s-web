import { useQuery } from '@tanstack/react-query';
import { type GetGroupsParams, getGroups } from '../api/get-groups';

export const GROUP_QUERY_KEYS = {
  all: ['groups'] as const,
  lists: () => [...GROUP_QUERY_KEYS.all, 'list'] as const,
  list: (filters: string) => [...GROUP_QUERY_KEYS.lists(), { filters }] as const,
  details: () => [...GROUP_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...GROUP_QUERY_KEYS.details(), id] as const,
};

export function useGroups(params?: GetGroupsParams) {
  return useQuery({
    queryKey: GROUP_QUERY_KEYS.list(JSON.stringify(params)),
    queryFn: () => getGroups(params),
  });
}
