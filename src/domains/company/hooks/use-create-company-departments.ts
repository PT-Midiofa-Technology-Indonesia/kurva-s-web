'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ENTITY_NAMES, TOAST_MESSAGES } from '@/shared/constants/toast-messages';
import { getErrorMessage } from '@/shared/lib/api-error';
import { toast } from '@/shared/lib/toast';

import type { CreateCompanyDepartmentsPayload } from '../api/create-company-departments';
import { createCompanyDepartments } from '../api/create-company-departments';
import { COMPANY_QUERY_KEYS } from './use-companies';

export function useCreateCompanyDepartments(companyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCompanyDepartmentsPayload) =>
      createCompanyDepartments(companyId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COMPANY_QUERY_KEYS.detail(companyId) });
      toast.success({ title: TOAST_MESSAGES.SUCCESS.CREATED(ENTITY_NAMES.COMPANY) });
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error({ title: message });
    },
  });
}
