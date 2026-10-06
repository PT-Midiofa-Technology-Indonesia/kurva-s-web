'use client';

import { useQuery } from '@tanstack/react-query';
import { type GetProjectManpowerParams, getProjectManpower } from '../api/get-project-manpower';
import type { ProjectManpowerListItem } from '../types/project-manpower-rating';

export const PROJECT_MANPOWER_QUERY_KEYS = {
  all: ['project-manpower'] as const,
  lists: () => [...PROJECT_MANPOWER_QUERY_KEYS.all, 'list'] as const,
  list: (projectId: string, params?: GetProjectManpowerParams) =>
    [...PROJECT_MANPOWER_QUERY_KEYS.lists(), projectId, params] as const,
};

export function useProjectManpower(
  projectId: string,
  params: GetProjectManpowerParams = {},
  options: { enabled?: boolean } = {}
) {
  const enabled = (options.enabled ?? true) && !!projectId;

  return useQuery<ProjectManpowerListItem[]>({
    queryKey: PROJECT_MANPOWER_QUERY_KEYS.list(projectId, params),
    queryFn: () => getProjectManpower(projectId, params),
    enabled,
  });
}
