'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage } from '@/lib/api-error';
import { toast } from '@/lib/toast';
import { ENTITY_NAMES, TOAST_MESSAGES } from '@/shared/constants/toast-messages';
import type { UpdateDocumentTypePayload } from '../api/update-document-type';
import { updateDocumentType } from '../api/update-document-type';
import { DOCUMENT_TYPE_QUERY_KEYS } from './use-document-types';

export function useUpdateDocumentType(documentTypeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateDocumentTypePayload) => updateDocumentType(documentTypeId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DOCUMENT_TYPE_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: DOCUMENT_TYPE_QUERY_KEYS.detail(documentTypeId) });
      queryClient.invalidateQueries({ queryKey: DOCUMENT_TYPE_QUERY_KEYS.infinite() });
      toast.success({ title: TOAST_MESSAGES.SUCCESS.UPDATED(ENTITY_NAMES.DOCUMENT_TYPE) });
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error({ title: message });
    },
  });
}
