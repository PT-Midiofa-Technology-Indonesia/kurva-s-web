'use client';

import { useQuery } from '@tanstack/react-query';
import { getRatingCategoriesActive } from '../api/get-rating-categories-active';
import type { ProjectManpowerRatingCategory } from '../types/project-manpower-rating';

export const PROJECT_MANPOWER_RATING_CATEGORIES_QUERY_KEYS = {
  all: ['project-manpower-rating-categories'] as const,
  detail: () => [...PROJECT_MANPOWER_RATING_CATEGORIES_QUERY_KEYS.all, 'active'] as const,
};

export function useRatingCategoriesActive() {
  return useQuery<ProjectManpowerRatingCategory[]>({
    queryKey: PROJECT_MANPOWER_RATING_CATEGORIES_QUERY_KEYS.detail(),
    queryFn: getRatingCategoriesActive,
    placeholderData: (previousData) => previousData,
  });
}
