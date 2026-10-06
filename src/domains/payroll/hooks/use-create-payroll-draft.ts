'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage } from '@/shared/lib/api-error';
import { toast } from '@/shared/lib/toast';
import { createPayrollDraft } from '../api/create-payroll-draft';
import type { CreateDraftFormData } from '../types';
import { PAYROLL_QUERY_KEYS } from './query-keys';

export function useCreatePayrollDraft() {
  const queryClient = useQueryClient();

  return useMutation({
    retry: false,
    mutationFn: (params: CreateDraftFormData & { companyId: string }) => createPayrollDraft(params),
    onSuccess: () => {
      toast.success({ title: 'Payroll draft berhasil dibuat' });
      queryClient.invalidateQueries({ queryKey: PAYROLL_QUERY_KEYS.payrollDrafts });
    },
    onError: (error) => {
      toast.error({ title: getErrorMessage(error) });
    },
  });
}
