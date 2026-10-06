import { useQuery } from '@tanstack/react-query';
import { getSkillCatalog } from '../api/get-skill-catalog';
import { SKILL_CATALOG_QUERY_KEYS } from './use-skill-catalogs';

export function useSkillCatalog(id: string) {
  return useQuery({
    queryKey: SKILL_CATALOG_QUERY_KEYS.detail(id),
    queryFn: () => getSkillCatalog(id),
    enabled: !!id,
  });
}
