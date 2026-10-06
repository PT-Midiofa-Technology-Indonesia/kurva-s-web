'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ENTITY_NAMES, TOAST_MESSAGES } from '@/shared/constants/toast-messages';
import { getErrorMessage } from '@/shared/lib/api-error';
import { toast } from '@/shared/lib/toast';

import { deleteCompany } from '../api/delete-company';
import { COMPANY_QUERY_KEYS } from './use-companies';

export function useDeleteCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCompany(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COMPANY_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: COMPANY_QUERY_KEYS.infinite() });
      toast.success({ title: TOAST_MESSAGES.SUCCESS.DELETED(ENTITY_NAMES.COMPANY) });
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error({ title: message });
    },
  });
}
