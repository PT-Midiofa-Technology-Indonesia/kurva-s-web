'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelectedProjectStore } from '@/shared/store/selected-project';
import { delegateProjectTaskQc } from '../api/delegate-project-task-qc';
import type { DelegateProjectTasksQcPayload } from '../types/manpower-planning';
import { PROJECT_TASK_QUERY_KEYS } from './use-project-tasks';
import { PROJECT_TASKS_BOQ_QUERY_KEYS } from './use-project-tasks-boq';

export function useDelegateProjectTaskQc() {
  const queryClient = useQueryClient();
  const projectId = useSelectedProjectStore((s) => s.selectedProjectId);

  return useMutation({
    mutationFn: (payload: DelegateProjectTasksQcPayload) =>
      delegateProjectTaskQc(payload, projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECT_TASK_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: PROJECT_TASKS_BOQ_QUERY_KEYS.all });
    },
  });
}
