import { useQuery } from '@tanstack/react-query';
import { type GetSkillLevelsParams, getSkillLevels } from '../api/get-skill-levels';

export const SKILL_LEVEL_QUERY_KEYS = {
  all: ['skill-levels'] as const,
  lists: () => [...SKILL_LEVEL_QUERY_KEYS.all, 'list'] as const,
  list: (filters: string) => [...SKILL_LEVEL_QUERY_KEYS.lists(), { filters }] as const,
  details: () => [...SKILL_LEVEL_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...SKILL_LEVEL_QUERY_KEYS.details(), id] as const,
  infinite: () => ['skill-levels-infinite'] as const,
};

export function useSkillLevels(params?: GetSkillLevelsParams) {
  return useQuery({
    queryKey: [...SKILL_LEVEL_QUERY_KEYS.all, params],
    queryFn: () => getSkillLevels(params),
    placeholderData: (previousData) => previousData,
  });
}
