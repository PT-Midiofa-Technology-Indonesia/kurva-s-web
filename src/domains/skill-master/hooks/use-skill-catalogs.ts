import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import type { GetSkillCatalogsParams, GetSkillCatalogsResponse } from '../api/get-skill-catalogs';
import { getSkillCatalogs } from '../api/get-skill-catalogs';

export const SKILL_CATALOG_QUERY_KEYS = {
  all: ['skill-catalogs'] as const,
  lists: () => [...SKILL_CATALOG_QUERY_KEYS.all, 'list'] as const,
  list: (filters: string) => [...SKILL_CATALOG_QUERY_KEYS.lists(), { filters }] as const,
  details: () => [...SKILL_CATALOG_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...SKILL_CATALOG_QUERY_KEYS.details(), id] as const,
  infinite: () => ['skill-catalogs-infinite'] as const,
};

export function useSkillCatalogs(
  params?: GetSkillCatalogsParams,
  options?: Omit<
    UseQueryOptions<GetSkillCatalogsResponse, Error, GetSkillCatalogsResponse>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: [...SKILL_CATALOG_QUERY_KEYS.all, params],
    queryFn: () => getSkillCatalogs(params),
    ...options,
  });
}
