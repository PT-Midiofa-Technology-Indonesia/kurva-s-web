'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PROJECT_TASK_DETAIL_QUERY_KEYS } from '@/domains/project-control/hooks/use-project-task-detail-history';
import { useSelectedProjectStore } from '@/shared/store/selected-project';
import { markProjectTaskDone } from '../api/mark-project-task-done';
import type { MarkProjectTaskDonePayload } from '../types/manpower-planning';
import { PROJECT_TASK_QUERY_KEYS } from './use-project-tasks';
import { PROJECT_TASKS_BOQ_QUERY_KEYS } from './use-project-tasks-boq';

interface MarkProjectTaskDoneVariables {
  taskId: string;
  payload: MarkProjectTaskDonePayload;
}

export function useMarkProjectTaskDone() {
  const queryClient = useQueryClient();
  const projectId = useSelectedProjectStore((s) => s.selectedProjectId);

  return useMutation({
    mutationFn: ({ taskId, payload }: MarkProjectTaskDoneVariables) =>
      markProjectTaskDone(taskId, payload, projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECT_TASK_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: PROJECT_TASKS_BOQ_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: PROJECT_TASK_DETAIL_QUERY_KEYS.all });
    },
  });
}
