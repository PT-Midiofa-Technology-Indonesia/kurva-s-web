'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage, getFieldErrors } from '@/shared/lib/api-error';
import { toast } from '@/shared/lib/toast';
import { type CancelPayrollDraftParams, cancelPayrollDraft } from '../api/cancel-payroll-draft';
import { PAYROLL_QUERY_KEYS } from './query-keys';

export function useCancelPayrollDraft() {
  const queryClient = useQueryClient();

  return useMutation({
    retry: false,
    mutationFn: (params: CancelPayrollDraftParams) => cancelPayrollDraft(params),
    onSuccess: (detail, variables) => {
      toast.success({ title: 'Payroll draft berhasil dibatalkan' });
      queryClient.setQueryData(
        PAYROLL_QUERY_KEYS.payrollDraftDetail(variables.id, variables.companyId),
        detail
      );
      queryClient.invalidateQueries({ queryKey: PAYROLL_QUERY_KEYS.payrollDrafts });
      queryClient.invalidateQueries({
        queryKey: PAYROLL_QUERY_KEYS.payrollDraftDetail(variables.id, variables.companyId),
      });
    },
    onError: (error) => {
      const draftErrors = getFieldErrors(error)?.draft ?? [];
      const isAlreadyCancelled = draftErrors.some((message) => message.includes('finalized/paid'));
      toast.error({
        title: isAlreadyCancelled ? 'Draft ini sudah dibatalkan.' : getErrorMessage(error),
      });
    },
  });
}
