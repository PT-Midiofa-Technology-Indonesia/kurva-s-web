'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getErrorMessage } from '@/lib/api-error';
import { toast } from '@/lib/toast';
import { ENTITY_NAMES, TOAST_MESSAGES } from '@/shared/constants/toast-messages';

import { updateEmployeePayrollSettings } from '../api/update-employee-payroll-settings';
import type { UpdateEmployeePayrollSettingsPayload } from '../types';
import { EMPLOYEE_QUERY_KEYS } from './use-employees';

export function useUpdateEmployeePayrollSettings(employeeId: string, companyId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateEmployeePayrollSettingsPayload) =>
      updateEmployeePayrollSettings(employeeId, payload, companyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EMPLOYEE_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: EMPLOYEE_QUERY_KEYS.detail(employeeId) });
      toast.success({ title: TOAST_MESSAGES.SUCCESS.UPDATED(ENTITY_NAMES.EMPLOYEE) });
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error({ title: message });
    },
  });
}
