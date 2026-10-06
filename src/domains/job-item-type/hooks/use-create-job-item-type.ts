'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getErrorMessage } from '@/lib/api-error';
import { toast } from '@/lib/toast';
import { ENTITY_NAMES, TOAST_MESSAGES } from '@/shared/constants/toast-messages';

import { createJobItemType } from '../api/create-job-item-type';
import { JOB_ITEM_TYPE_QUERY_KEYS } from './use-job-item-types';

export function useCreateJobItemType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createJobItemType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: JOB_ITEM_TYPE_QUERY_KEYS.all });
      toast.success({ title: TOAST_MESSAGES.SUCCESS.CREATED(ENTITY_NAMES.JOB_ITEM_TYPE) });
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error({ title: message });
    },
  });
}
