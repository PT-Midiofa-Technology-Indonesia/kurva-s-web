'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage } from '@/lib/api-error';
import { toast } from '@/lib/toast';
import { ENTITY_NAMES, TOAST_MESSAGES } from '@/shared/constants/toast-messages';
import { updateEmployeeGrade } from '../api/update-employee-grade';
import type { UpdateEmployeeGradePayload } from '../types';
import { EMPLOYEE_GRADE_QUERY_KEYS } from './use-employee-grades';

export function useUpdateEmployeeGrade(employeeGradeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateEmployeeGradePayload) =>
      updateEmployeeGrade(employeeGradeId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EMPLOYEE_GRADE_QUERY_KEYS.all });
      queryClient.invalidateQueries({
        queryKey: EMPLOYEE_GRADE_QUERY_KEYS.detail(employeeGradeId),
      });
      queryClient.invalidateQueries({ queryKey: EMPLOYEE_GRADE_QUERY_KEYS.infinite() });
      toast.success({ title: TOAST_MESSAGES.SUCCESS.UPDATED(ENTITY_NAMES.EMPLOYEE_GRADE) });
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error({ title: message });
    },
  });
}
