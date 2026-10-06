import { useQuery } from '@tanstack/react-query';
import {
  type GetHierarchyManagementsTreeParams,
  getHierarchyManagementsTree,
} from '../api/get-hierarchy-managements-tree';
import { HIERARCHY_MANAGEMENT_QUERY_KEYS } from './use-hierarchy-managements';

export function useHierarchyManagementsTree(params?: GetHierarchyManagementsTreeParams) {
  return useQuery({
    queryKey: HIERARCHY_MANAGEMENT_QUERY_KEYS.tree(JSON.stringify(params)),
    queryFn: () => getHierarchyManagementsTree(params),
    enabled: Boolean(params?.companyId),
  });
}
