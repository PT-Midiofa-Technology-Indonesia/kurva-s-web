'use client';

import { useQuery } from '@tanstack/react-query';
import { getProjectBOQItemCosts } from '../api/get-project-boq-item-costs';

export const PROJECT_BOQ_ITEM_COSTS_QUERY_KEYS = {
  all: ['project-boq-item-costs'] as const,
  detail: (projectId: string, itemId: string) =>
    [...PROJECT_BOQ_ITEM_COSTS_QUERY_KEYS.all, projectId, itemId] as const,
};

export function useProjectBOQItemCosts(
  projectId: string | null | undefined,
  itemId: string | null | undefined,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: PROJECT_BOQ_ITEM_COSTS_QUERY_KEYS.detail(projectId ?? '', itemId ?? ''),
    queryFn: () => getProjectBOQItemCosts(projectId!, itemId!),
    enabled: !!projectId && !!itemId && options?.enabled !== false,
  });
}
