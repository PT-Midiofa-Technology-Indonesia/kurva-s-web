'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage } from '@/shared/lib/api-error';
import { toast } from '@/shared/lib/toast';
import type { CreateProjectActivityPayload } from '../api/create-project-activity';
import { createProjectActivity } from '../api/create-project-activity';
import { PROSPECT_QUERY_KEYS } from './use-prospects';

export function useCreateProjectActivity(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateProjectActivityPayload) => createProjectActivity(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROSPECT_QUERY_KEYS.detail(projectId) });
    },
    onError: (error) => {
      toast.error({ title: getErrorMessage(error) });
    },
  });
}
