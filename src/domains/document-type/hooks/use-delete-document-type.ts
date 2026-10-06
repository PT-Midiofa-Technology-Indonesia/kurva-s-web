'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage } from '@/lib/api-error';
import { toast } from '@/lib/toast';
import { ENTITY_NAMES, TOAST_MESSAGES } from '@/shared/constants/toast-messages';
import { deleteDocumentType } from '../api/delete-document-type';
import { DOCUMENT_TYPE_QUERY_KEYS } from './use-document-types';

export function useDeleteDocumentType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteDocumentType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DOCUMENT_TYPE_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: DOCUMENT_TYPE_QUERY_KEYS.infinite() });
      toast.success({ title: TOAST_MESSAGES.SUCCESS.DELETED(ENTITY_NAMES.DOCUMENT_TYPE) });
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error({ title: message });
    },
  });
}
