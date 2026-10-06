'use client';

import { useQuery } from '@tanstack/react-query';
import { getHierarchyManagement } from '../api/get-hierarchy-management';
import { HIERARCHY_MANAGEMENT_QUERY_KEYS } from './use-hierarchy-managements';

export function useHierarchyManagement(id: string) {
  return useQuery({
    queryKey: HIERARCHY_MANAGEMENT_QUERY_KEYS.detail(id),
    queryFn: () => getHierarchyManagement(id),
    enabled: !!id,
    select: (data) => (data ? data : null),
  });
}
