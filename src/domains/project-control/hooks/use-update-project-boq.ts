'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getErrorMessage } from '@/shared/lib/api-error';
import { toast } from '@/shared/lib/toast';
import { type UpdateProjectBOQPayload, updateProjectBOQ } from '../api/update-project-boq';
import { PROJECT_BOQ_QUERY_KEYS } from './use-project-boq';

export function useUpdateProjectBOQ(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ boqId, payload }: { boqId: string; payload: UpdateProjectBOQPayload }) =>
      updateProjectBOQ(projectId, boqId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: PROJECT_BOQ_QUERY_KEYS.detail(projectId),
      });
      const { isRabComplete, isCcoComplete } = variables.payload;
      if (isCcoComplete != null) {
        toast.success({
          title: isCcoComplete
            ? 'BoQ Execution berhasil di-complete.'
            : 'BoQ Execution dibatalkan complete.',
        });
      } else if (isRabComplete != null) {
        toast.success({
          title: isRabComplete
            ? 'BoQ Planning berhasil di-complete.'
            : 'BoQ Planning dibatalkan complete.',
        });
      }
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error({ title: message });
    },
  });
}
