'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage, getFieldErrors } from '@/shared/lib/api-error';
import { toast } from '@/shared/lib/toast';
import { updateSalaryStructure } from '../api/update-salary-structure';
import { hasPayrollRowErrors } from '../services/parse-payroll-item-errors';
import type { UpdateSalaryStructurePayload } from '../types';
import { PAYROLL_QUERY_KEYS } from './query-keys';

export function useUpdateSalaryStructure() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: UpdateSalaryStructurePayload) => updateSalaryStructure(params),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: PAYROLL_QUERY_KEYS.salaryStructureGrades,
      });
      queryClient.invalidateQueries({
        queryKey: PAYROLL_QUERY_KEYS.salaryStructureDetail,
      });
      queryClient.invalidateQueries({
        queryKey: PAYROLL_QUERY_KEYS.employeeSalaryAdjustments,
      });
      queryClient.invalidateQueries({
        queryKey: PAYROLL_QUERY_KEYS.employeeSalaryAdjustmentDetail,
      });
    },
    onError: (error) => {
      const fieldErrors = getFieldErrors(error);
      if (hasPayrollRowErrors(fieldErrors)) return;
      toast.error({ title: fieldErrors?.items?.[0] ?? getErrorMessage(error) });
    },
  });
}
