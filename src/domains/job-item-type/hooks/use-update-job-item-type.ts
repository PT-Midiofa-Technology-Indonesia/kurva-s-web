'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getErrorMessage } from '@/lib/api-error';
import { toast } from '@/lib/toast';
import { ENTITY_NAMES, TOAST_MESSAGES } from '@/shared/constants/toast-messages';

import type { UpdateJobItemTypePayload } from '../api/update-job-item-type';
import { updateJobItemType } from '../api/update-job-item-type';
import { JOB_ITEM_TYPE_QUERY_KEYS } from './use-job-item-types';

export function useUpdateJobItemType(jobItemTypeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateJobItemTypePayload) => updateJobItemType(jobItemTypeId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: JOB_ITEM_TYPE_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: JOB_ITEM_TYPE_QUERY_KEYS.detail(jobItemTypeId) });
      toast.success({ title: TOAST_MESSAGES.SUCCESS.UPDATED(ENTITY_NAMES.JOB_ITEM_TYPE) });
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error({ title: message });
    },
  });
}
