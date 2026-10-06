'use client';

import { useQuery } from '@tanstack/react-query';
import { getProjectBOQItems } from '../api/get-project-boq-items';

export const PROJECT_BOQ_ITEMS_QUERY_KEYS = {
  all: ['project-boq-items'] as const,
  list: (projectId: string, parentId: string) =>
    [...PROJECT_BOQ_ITEMS_QUERY_KEYS.all, projectId, parentId] as const,
};

export function useProjectBOQItems(
  projectId: string | null | undefined,
  parentId: string | null | undefined
) {
  return useQuery({
    queryKey: PROJECT_BOQ_ITEMS_QUERY_KEYS.list(projectId ?? '', parentId ?? ''),
    queryFn: () => getProjectBOQItems(projectId!, { parentId: parentId! }),
    enabled: !!projectId && !!parentId,
  });
}
