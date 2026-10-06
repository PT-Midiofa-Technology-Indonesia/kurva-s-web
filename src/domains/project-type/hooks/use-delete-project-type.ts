'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage } from '@/lib/api-error';
import { toast } from '@/lib/toast';
import { ENTITY_NAMES, TOAST_MESSAGES } from '@/shared/constants/toast-messages';
import { deleteProjectType } from '../api/delete-project-type';
import { PROJECT_TYPE_QUERY_KEYS } from './use-project-types';

export function useDeleteProjectType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProjectType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECT_TYPE_QUERY_KEYS.all });
      toast.success({ title: TOAST_MESSAGES.SUCCESS.DELETED(ENTITY_NAMES.PROJECT_TYPE) });
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error({ title: message });
    },
  });
}
