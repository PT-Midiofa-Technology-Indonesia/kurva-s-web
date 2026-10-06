'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage } from '@/lib/api-error';
import { toast } from '@/lib/toast';
import { reviewQcTask } from '../api/review-qc-task';
import { MEETING_TASK_QUERY_KEYS } from './use-meeting-tasks';

export function useReviewQcTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reviewQcTask,
    onSuccess: () => {
      // Invalidates the shared root so BOTH the QC list and its detail refresh.
      queryClient.invalidateQueries({ queryKey: MEETING_TASK_QUERY_KEYS.all });
      toast.success({ title: 'Evaluasi QC berhasil disimpan.' });
    },
    onError: (error) => {
      toast.error({ title: getErrorMessage(error) });
    },
  });
}
