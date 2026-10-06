'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ENTITY_NAMES, TOAST_MESSAGES } from '@/shared/constants/toast-messages';
import { getErrorMessage } from '@/shared/lib/api-error';
import { toast } from '@/shared/lib/toast';

import type { UpdateCompanyPayload } from '../api/update-company';
import { updateCompany } from '../api/update-company';
import { COMPANY_QUERY_KEYS } from './use-companies';

export function useUpdateCompany(companyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateCompanyPayload) => updateCompany(companyId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COMPANY_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: COMPANY_QUERY_KEYS.detail(companyId) });
      queryClient.invalidateQueries({ queryKey: COMPANY_QUERY_KEYS.infinite() });
      toast.success({ title: TOAST_MESSAGES.SUCCESS.UPDATED(ENTITY_NAMES.COMPANY) });
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error({ title: message });
    },
  });
}
