import { useQuery } from '@tanstack/react-query';
import {
  type GetHierarchyManagementsParams,
  getHierarchyManagements,
} from '../api/get-hierarchy-managements';

export const HIERARCHY_MANAGEMENT_QUERY_KEYS = {
  all: ['hierarchy-managements'] as const,
  lists: () => [...HIERARCHY_MANAGEMENT_QUERY_KEYS.all, 'list'] as const,
  list: (filters: string) => [...HIERARCHY_MANAGEMENT_QUERY_KEYS.lists(), { filters }] as const,
  details: () => [...HIERARCHY_MANAGEMENT_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...HIERARCHY_MANAGEMENT_QUERY_KEYS.details(), id] as const,
  infinite: () => ['hierarchy-managements-infinite'] as const,
  positions: (filters: string) =>
    [...HIERARCHY_MANAGEMENT_QUERY_KEYS.all, 'positions', { filters }] as const,
  tree: (filters: string) => [...HIERARCHY_MANAGEMENT_QUERY_KEYS.all, 'tree', { filters }] as const,
};

export function useHierarchyManagements(params?: GetHierarchyManagementsParams) {
  return useQuery({
    queryKey: HIERARCHY_MANAGEMENT_QUERY_KEYS.list(JSON.stringify(params)),
    queryFn: () => getHierarchyManagements(params),
    enabled: Boolean(params?.companyId),
  });
}
