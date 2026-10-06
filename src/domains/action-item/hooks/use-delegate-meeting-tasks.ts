'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage } from '@/lib/api-error';
import { toast } from '@/lib/toast';
import { delegateMeetingTask } from '../api/delegate-meeting-task';
import { MEETING_TASK_QUERY_KEYS } from './use-meeting-tasks';

export interface DelegateMeetingTasksVariables {
  ids: string[];
  employeeId: string;
  companyId: string;
}

/**
 * The API delegates ONE task per request, so a bulk delegate fans out.
 * Promise.all rejects on the first failure — a partial delegation is then
 * reported as an error while the invalidate below still refreshes whatever
 * did succeed.
 */
export function useDelegateMeetingTasks() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ids, employeeId, companyId }: DelegateMeetingTasksVariables) =>
      Promise.all(ids.map((id) => delegateMeetingTask({ id, employeeId, companyId }))),
    onSuccess: (results) => {
      queryClient.invalidateQueries({ queryKey: MEETING_TASK_QUERY_KEYS.all });
      toast.success({ title: `${results.length} task berhasil didelegasikan.` });
    },
    onError: (error) => {
      queryClient.invalidateQueries({ queryKey: MEETING_TASK_QUERY_KEYS.all });
      toast.error({ title: getErrorMessage(error) });
    },
  });
}
