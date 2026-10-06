'use client';

import { useQuery } from '@tanstack/react-query';
import { getProjectDetailTaskHistory } from '../api';

export const PROJECT_TASK_DETAIL_QUERY_KEYS = {
  all: ['project-task-boq'] as const,
  detail: (taskId: string) => [...PROJECT_TASK_DETAIL_QUERY_KEYS.all, taskId] as const,
} as const;

export function useProjectTaskDetailHistory(taskId: string | null | undefined) {
  return useQuery({
    queryKey: PROJECT_TASK_DETAIL_QUERY_KEYS.detail(taskId ?? ''),
    queryFn: () => getProjectDetailTaskHistory(taskId!),
    enabled: !!taskId,
  });
}
