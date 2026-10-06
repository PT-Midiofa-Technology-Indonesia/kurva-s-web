'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage } from '@/lib/api-error';
import { toast } from '@/lib/toast';
import { doneMeetingTask } from '../api/done-meeting-task';
import { MEETING_TASK_QUERY_KEYS } from './use-meeting-tasks';

export function useDoneMeetingTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: doneMeetingTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MEETING_TASK_QUERY_KEYS.all });
      toast.success({ title: 'Task berhasil diselesaikan.' });
    },
    onError: (error) => {
      toast.error({ title: getErrorMessage(error) });
    },
  });
}
