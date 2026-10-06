'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { TOAST_MESSAGES } from '@/shared/constants/toast-messages';
import { getErrorMessage } from '@/shared/lib/api-error';
import { toast } from '@/shared/lib/toast';
import { createProjectBOQ } from '../api/create-project-boq';
import { PROJECT_BOQ_QUERY_KEYS } from './use-project-boq';

export function useCreateBOQ() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: string) => createProjectBOQ(projectId),
    onSuccess: (_data, projectId) => {
      queryClient.invalidateQueries({ queryKey: PROJECT_BOQ_QUERY_KEYS.detail(projectId) });
      toast.success({ title: TOAST_MESSAGES.SUCCESS.CREATED('BoQ') });
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error({ title: message });
    },
  });
}
