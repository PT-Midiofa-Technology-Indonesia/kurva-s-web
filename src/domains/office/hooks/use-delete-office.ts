'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ENTITY_NAMES, TOAST_MESSAGES } from '@/shared/constants/toast-messages';
import { getErrorMessage } from '@/shared/lib/api-error';
import { toast } from '@/shared/lib/toast';

import { deleteOffice } from '../api/delete-office';
import { OFFICE_QUERY_KEYS } from './use-offices';

export function useDeleteOffice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteOffice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: OFFICE_QUERY_KEYS.lists() });
      toast.success({ title: TOAST_MESSAGES.SUCCESS.DELETED(ENTITY_NAMES.OFFICE) });
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error({ title: message });
    },
  });
}
