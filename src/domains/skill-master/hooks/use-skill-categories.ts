import { useQuery } from '@tanstack/react-query';
import { type GetSkillCategoriesParams, getSkillCategories } from '../api/get-skill-categories';

export const SKILL_CATEGORY_QUERY_KEYS = {
  all: ['skill-categories'] as const,
  lists: () => [...SKILL_CATEGORY_QUERY_KEYS.all, 'list'] as const,
  list: (filters: string) => [...SKILL_CATEGORY_QUERY_KEYS.lists(), { filters }] as const,
  details: () => [...SKILL_CATEGORY_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...SKILL_CATEGORY_QUERY_KEYS.details(), id] as const,
  infinite: () => ['skill-categories-infinite'] as const,
};

export function useSkillCategories(params?: GetSkillCategoriesParams) {
  return useQuery({
    queryKey: [...SKILL_CATEGORY_QUERY_KEYS.all, params],
    queryFn: () => getSkillCategories(params),
    placeholderData: (previousData) => previousData,
  });
}
