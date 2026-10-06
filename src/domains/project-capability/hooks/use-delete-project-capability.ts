'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage } from '@/lib/api-error';
import { toast } from '@/lib/toast';
import { ENTITY_NAMES, TOAST_MESSAGES } from '@/shared/constants/toast-messages';
import { deleteProjectCapability } from '../api/delete-project-capability';
import { PROJECT_CAPABILITY_QUERY_KEYS } from './use-project-capabilities';

export function useDeleteProjectCapability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProjectCapability,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECT_CAPABILITY_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: PROJECT_CAPABILITY_QUERY_KEYS.infinite() });
      toast.success({ title: TOAST_MESSAGES.SUCCESS.DELETED(ENTITY_NAMES.PROJECT_CAPABILITY) });
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error({ title: message });
    },
  });
}
