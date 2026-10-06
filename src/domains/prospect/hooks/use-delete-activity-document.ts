'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage } from '@/shared/lib/api-error';
import { toast } from '@/shared/lib/toast';
import type { DeleteActivityDocumentPayload } from '../api/delete-activity-document';
import { deleteActivityDocument } from '../api/delete-activity-document';
import { PROSPECT_QUERY_KEYS } from './use-prospects';

export function useDeleteActivityDocument(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: DeleteActivityDocumentPayload) => deleteActivityDocument(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROSPECT_QUERY_KEYS.detail(projectId) });
    },
    onError: (error) => {
      toast.error({ title: getErrorMessage(error) });
    },
  });
}
