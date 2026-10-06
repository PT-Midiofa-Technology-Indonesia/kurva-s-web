'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage, getFieldErrors } from '@/shared/lib/api-error';
import { toast } from '@/shared/lib/toast';
import type { UploadProjectDocumentPayload } from '../api/upload-project-document';
import { uploadProjectDocument } from '../api/upload-project-document';
import { PROSPECT_QUERY_KEYS } from './use-prospects';

export function useUploadProjectDocument(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UploadProjectDocumentPayload) => uploadProjectDocument(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROSPECT_QUERY_KEYS.detail(projectId) });
    },
    onError: (error) => {
      const fieldErrors = getFieldErrors(error);
      toast.error({ title: fieldErrors?.file?.[0] ?? getErrorMessage(error) });
    },
  });
}
