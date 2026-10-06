'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage } from '@/shared/lib/api-error';
import { toast } from '@/shared/lib/toast';
import type { DeleteProjectDocumentPayload } from '../api/delete-project-document';
import { deleteProjectDocument } from '../api/delete-project-document';
import { PROSPECT_QUERY_KEYS } from './use-prospects';

export function useDeleteProjectDocument(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: DeleteProjectDocumentPayload) => deleteProjectDocument(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROSPECT_QUERY_KEYS.detail(projectId) });
    },
    onError: (error) => {
      toast.error({ title: getErrorMessage(error) });
    },
  });
}
