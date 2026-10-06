'use client';

import { useQuery } from '@tanstack/react-query';
import { getProjectHierarchyNodeDetail } from '../api/get-project-hierarchy-node-detail';

const PROJECT_HIERARCHY_NODES_QUERY_KEY = 'project-hierarchy-nodes';

export function useProjectHierarchyNodeDetail(nodeId: string) {
  return useQuery({
    queryKey: [PROJECT_HIERARCHY_NODES_QUERY_KEY, 'detail', nodeId],
    queryFn: () => getProjectHierarchyNodeDetail(nodeId),
    enabled: !!nodeId,
  });
}
