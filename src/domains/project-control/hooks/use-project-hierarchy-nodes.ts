'use client';

import { useQuery } from '@tanstack/react-query';
import { getProjectHierarchyNodes } from '../api/get-project-hierarchy-nodes';

export function useProjectHierarchyNodes(projectId: string) {
  return useQuery({
    queryKey: ['project-hierarchy-nodes', projectId],
    queryFn: () => getProjectHierarchyNodes(projectId),
    enabled: !!projectId,
  });
}
