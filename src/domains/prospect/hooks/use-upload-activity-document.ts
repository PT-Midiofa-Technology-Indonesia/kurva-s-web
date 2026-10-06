'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage } from '@/shared/lib/api-error';
import { toast } from '@/shared/lib/toast';
import type { UploadActivityDocumentPayload } from '../api/upload-activity-document';
import { uploadActivityDocument } from '../api/upload-activity-document';
import { PROSPECT_QUERY_KEYS } from './use-prospects';

export function useUploadActivityDocument(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UploadActivityDocumentPayload) => uploadActivityDocument(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROSPECT_QUERY_KEYS.detail(projectId) });
    },
    onError: (error) => {
      toast.error({ title: getErrorMessage(error) });
    },
  });
}
