'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelectedProjectStore } from '@/shared/store/selected-project';
import { cancelProjectTask } from '../api/cancel-project-task';
import { PROJECT_TASK_QUERY_KEYS } from './use-project-tasks';
import { PROJECT_TASKS_BOQ_QUERY_KEYS } from './use-project-tasks-boq';

export function useCancelProjectTask() {
  const queryClient = useQueryClient();
  const projectId = useSelectedProjectStore((s) => s.selectedProjectId);

  return useMutation({
    mutationFn: (taskId: string) => cancelProjectTask(taskId, projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECT_TASK_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: PROJECT_TASKS_BOQ_QUERY_KEYS.all });
    },
  });
}
