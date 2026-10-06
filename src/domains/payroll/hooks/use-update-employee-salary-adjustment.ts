'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage, getFieldErrors } from '@/shared/lib/api-error';
import { toast } from '@/shared/lib/toast';
import { updateEmployeeSalaryAdjustment } from '../api/update-employee-salary-adjustment';
import { hasPayrollRowErrors } from '../services/parse-payroll-item-errors';
import type { UpdateEmployeeSalaryAdjustmentPayload } from '../types';
import { PAYROLL_QUERY_KEYS } from './query-keys';

export function useUpdateEmployeeSalaryAdjustment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      employeeId,
      companyId,
      ...payload
    }: UpdateEmployeeSalaryAdjustmentPayload & {
      employeeId: string;
      companyId?: string | null;
    }) => updateEmployeeSalaryAdjustment(employeeId, { ...payload, companyId }),
    onSuccess: () => {
      toast.success({ title: 'Salary adjustment berhasil disimpan' });
      queryClient.invalidateQueries({ queryKey: PAYROLL_QUERY_KEYS.employeeSalaryAdjustments });
      queryClient.invalidateQueries({
        queryKey: PAYROLL_QUERY_KEYS.employeeSalaryAdjustmentDetail,
      });
    },
    onError: (error) => {
      const fieldErrors = getFieldErrors(error);
      // row errors are rendered on the inputs themselves; a generic toast on top is noise
      if (hasPayrollRowErrors(fieldErrors)) return;
      toast.error({ title: fieldErrors?.items?.[0] ?? getErrorMessage(error) });
    },
  });
}
