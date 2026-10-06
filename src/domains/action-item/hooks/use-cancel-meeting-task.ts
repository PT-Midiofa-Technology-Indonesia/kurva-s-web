'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage } from '@/lib/api-error';
import { toast } from '@/lib/toast';
import { cancelMeetingTask } from '../api/cancel-meeting-task';
import { MEETING_TASK_QUERY_KEYS } from './use-meeting-tasks';

export function useCancelMeetingTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelMeetingTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MEETING_TASK_QUERY_KEYS.all });
      toast.success({ title: 'Task berhasil dibatalkan.' });
    },
    onError: (error) => {
      toast.error({ title: getErrorMessage(error) });
    },
  });
}
