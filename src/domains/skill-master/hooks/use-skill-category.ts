import { useQuery } from '@tanstack/react-query';
import { getSkillCategory } from '../api/get-skill-category';
import { SKILL_CATEGORY_QUERY_KEYS } from './use-skill-categories';

export function useSkillCategory(id: string) {
  return useQuery({
    queryKey: SKILL_CATEGORY_QUERY_KEYS.detail(id),
    queryFn: () => getSkillCategory(id),
    enabled: !!id,
  });
}
