'use client';

import { useQuery } from '@tanstack/react-query';
import { getProjectBOQCatalogPrices } from '../api/get-project-boq-catalog-prices';

export const PROJECT_BOQ_CATALOG_PRICES_QUERY_KEYS = {
  all: ['project-boq-catalog-prices'] as const,
  detail: (projectId: string) => [...PROJECT_BOQ_CATALOG_PRICES_QUERY_KEYS.all, projectId] as const,
} as const;

export function useProjectBOQCatalogPrices(
  projectId: string | null | undefined,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: PROJECT_BOQ_CATALOG_PRICES_QUERY_KEYS.detail(projectId ?? ''),
    queryFn: () => getProjectBOQCatalogPrices(projectId!),
    enabled: (options?.enabled ?? true) && !!projectId,
    staleTime: 0, // always refetch when modal opens
  });
}
