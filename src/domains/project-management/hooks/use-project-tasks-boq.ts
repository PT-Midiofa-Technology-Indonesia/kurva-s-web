'use client';

import { useQuery } from '@tanstack/react-query';
import { useSelectedProjectStore } from '@/shared/store/selected-project';
import { getProjectTasksBoq, type ProjectTaskBoqCategory } from '../api/get-project-tasks-boq';

export const PROJECT_TASKS_BOQ_QUERY_KEYS = {
  all: ['project-tasks-boq'] as const,
  detail: (projectId: string, taskCategory: ProjectTaskBoqCategory) =>
    [...PROJECT_TASKS_BOQ_QUERY_KEYS.all, projectId, taskCategory] as const,
} as const;

export function useProjectTasksBoq(taskCategory: ProjectTaskBoqCategory) {
  const projectId = useSelectedProjectStore((s) => s.selectedProjectId);

  return useQuery({
    queryKey: PROJECT_TASKS_BOQ_QUERY_KEYS.detail(projectId ?? '', taskCategory),
    queryFn: () => getProjectTasksBoq({ taskCategory }, projectId),
    enabled: !!projectId,
  });
}
