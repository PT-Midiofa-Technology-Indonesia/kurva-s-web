'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelectedProjectStore } from '@/shared/store/selected-project';
import { claimProjectTask } from '../api/claim-project-task';
import { PROJECT_TASK_QUERY_KEYS } from './use-project-tasks';
import { PROJECT_TASKS_BOQ_QUERY_KEYS } from './use-project-tasks-boq';

export function useClaimProjectTask() {
  const queryClient = useQueryClient();
  const projectId = useSelectedProjectStore((s) => s.selectedProjectId);

  return useMutation({
    mutationFn: (taskId: string) => claimProjectTask(taskId, projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECT_TASK_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: PROJECT_TASKS_BOQ_QUERY_KEYS.all });
    },
  });
}
