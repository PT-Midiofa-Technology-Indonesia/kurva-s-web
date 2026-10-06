'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getErrorMessage } from '@/lib/api-error';
import { toast } from '@/lib/toast';
import { ENTITY_NAMES, TOAST_MESSAGES } from '@/shared/constants/toast-messages';

import type { UpdateProjectCapabilityPayload } from '../api/update-project-capability';
import { updateProjectCapability } from '../api/update-project-capability';
import { PROJECT_CAPABILITY_QUERY_KEYS } from './use-project-capabilities';

export function useUpdateProjectCapability(projectCapabilityId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateProjectCapabilityPayload) =>
      updateProjectCapability(projectCapabilityId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECT_CAPABILITY_QUERY_KEYS.all });
      queryClient.invalidateQueries({
        queryKey: PROJECT_CAPABILITY_QUERY_KEYS.detail(projectCapabilityId),
      });
      queryClient.invalidateQueries({ queryKey: PROJECT_CAPABILITY_QUERY_KEYS.infinite() });
      toast.success({ title: TOAST_MESSAGES.SUCCESS.UPDATED(ENTITY_NAMES.PROJECT_CAPABILITY) });
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error({ title: message });
    },
  });
}
