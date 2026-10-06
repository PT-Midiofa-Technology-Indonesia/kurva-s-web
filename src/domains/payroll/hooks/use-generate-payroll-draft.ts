'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage } from '@/shared/lib/api-error';
import { toast } from '@/shared/lib/toast';
import { generatePayrollDraft } from '../api/generate-payroll-draft';
import { PAYROLL_QUERY_KEYS } from './query-keys';

export function useGeneratePayrollDraft() {
  const queryClient = useQueryClient();

  return useMutation({
    retry: false,
    mutationFn: (params: { id: string; companyId: string }) => generatePayrollDraft(params),
    onSuccess: (detail, variables) => {
      toast.success({ title: 'Payroll berhasil di-generate' });
      queryClient.invalidateQueries({ queryKey: PAYROLL_QUERY_KEYS.payrollDrafts });
      queryClient.setQueryData(
        PAYROLL_QUERY_KEYS.payrollDraftDetail(variables.id, variables.companyId),
        detail
      );
      queryClient.invalidateQueries({
        queryKey: PAYROLL_QUERY_KEYS.payrollDraftDetail(variables.id, variables.companyId),
      });
      queryClient.removeQueries({
        queryKey: PAYROLL_QUERY_KEYS.payrollDraftPreview(variables.id, variables.companyId),
        exact: true,
      });
    },
    onError: (error) => {
      toast.error({ title: getErrorMessage(error) });
    },
  });
}
