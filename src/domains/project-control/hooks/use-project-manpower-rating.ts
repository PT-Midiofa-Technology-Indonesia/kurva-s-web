'use client';

import { useQuery } from '@tanstack/react-query';
import { getProjectManpowerRating } from '../api/get-project-manpower-rating';
import type { ProjectManpowerRatingEnvelope } from '../types/project-manpower-rating';

export const PROJECT_MANPOWER_RATING_QUERY_KEYS = {
  all: ['project-manpower-rating'] as const,
  details: () => [...PROJECT_MANPOWER_RATING_QUERY_KEYS.all, 'detail'] as const,
  detail: (projectId: string, employeeId: string) =>
    [...PROJECT_MANPOWER_RATING_QUERY_KEYS.details(), projectId, employeeId] as const,
};

export function useProjectManpowerRating(
  projectId: string,
  employeeId: string | null,
  enabled: boolean
) {
  return useQuery<ProjectManpowerRatingEnvelope>({
    queryKey: PROJECT_MANPOWER_RATING_QUERY_KEYS.detail(projectId, employeeId ?? ''),
    queryFn: () => getProjectManpowerRating(projectId, employeeId!),
    enabled: enabled && !!projectId && !!employeeId,
  });
}
