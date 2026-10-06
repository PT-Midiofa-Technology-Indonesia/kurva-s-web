'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { TOAST_MESSAGES } from '@/shared/constants/toast-messages';
import { getErrorMessage } from '@/shared/lib/api-error';
import { toast } from '@/shared/lib/toast';
import { type GenerateBOQPayload, generateProjectBOQ } from '../api/generate-project-boq';
import { PROJECT_BOQ_QUERY_KEYS } from './use-project-boq';

export function useGenerateBOQ() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, payload }: { projectId: string; payload: GenerateBOQPayload }) =>
      generateProjectBOQ(projectId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: PROJECT_BOQ_QUERY_KEYS.detail(variables.projectId),
      });
      toast.success({ title: TOAST_MESSAGES.SUCCESS.CREATED('BoQ') });
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error({ title: message });
    },
  });
}
