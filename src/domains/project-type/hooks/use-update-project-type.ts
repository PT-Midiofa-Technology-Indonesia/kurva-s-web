'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getErrorMessage } from '@/lib/api-error';
import { toast } from '@/lib/toast';
import { ENTITY_NAMES, TOAST_MESSAGES } from '@/shared/constants/toast-messages';

import type { UpdateProjectTypePayload } from '../api/update-project-type';
import { updateProjectType } from '../api/update-project-type';
import { PROJECT_TYPE_QUERY_KEYS } from './use-project-types';

export function useUpdateProjectType(projectTypeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateProjectTypePayload) => updateProjectType(projectTypeId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECT_TYPE_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: PROJECT_TYPE_QUERY_KEYS.detail(projectTypeId) });
      toast.success({ title: TOAST_MESSAGES.SUCCESS.UPDATED(ENTITY_NAMES.PROJECT_TYPE) });
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error({ title: message });
    },
  });
}
