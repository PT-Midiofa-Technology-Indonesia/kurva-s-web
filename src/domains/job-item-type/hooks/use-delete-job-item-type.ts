'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage } from '@/lib/api-error';
import { toast } from '@/lib/toast';
import { ENTITY_NAMES, TOAST_MESSAGES } from '@/shared/constants/toast-messages';
import { deleteJobItemType } from '../api/delete-job-item-type';
import { JOB_ITEM_TYPE_QUERY_KEYS } from './use-job-item-types';

export function useDeleteJobItemType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteJobItemType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: JOB_ITEM_TYPE_QUERY_KEYS.all });
      toast.success({ title: TOAST_MESSAGES.SUCCESS.DELETED(ENTITY_NAMES.JOB_ITEM_TYPE) });
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error({ title: message });
    },
  });
}
