'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ENTITY_NAMES, TOAST_MESSAGES } from '@/shared/constants/toast-messages';
import { getErrorMessage } from '@/shared/lib/api-error';
import { toast } from '@/shared/lib/toast';
import type { DeletePoDraftParams } from '../api/delete-po-draft';
import { deletePoDraft } from '../api/delete-po-draft';
import { PROCUREMENT_QUERY_KEYS } from './use-po-drafts';

export function useDeletePoDraft() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: DeletePoDraftParams) => deletePoDraft(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROCUREMENT_QUERY_KEYS.lists() });
      toast.success({
        title: TOAST_MESSAGES.SUCCESS.DELETED(ENTITY_NAMES.PURCHASE_PLANNING),
      });
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error({ title: message });
    },
  });
}
