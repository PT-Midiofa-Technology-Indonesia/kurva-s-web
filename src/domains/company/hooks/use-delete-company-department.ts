'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ENTITY_NAMES, TOAST_MESSAGES } from '@/shared/constants/toast-messages';
import { getErrorMessage } from '@/shared/lib/api-error';
import { toast } from '@/shared/lib/toast';

import { deleteCompanyDepartment } from '../api/delete-company-department';
import { COMPANY_QUERY_KEYS } from './use-companies';

export function useDeleteCompanyDepartment(companyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (departmentId: string) => deleteCompanyDepartment(companyId, departmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COMPANY_QUERY_KEYS.detail(companyId) });
      toast.success({ title: TOAST_MESSAGES.SUCCESS.DELETED(ENTITY_NAMES.COMPANY) });
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error({ title: message });
    },
  });
}
