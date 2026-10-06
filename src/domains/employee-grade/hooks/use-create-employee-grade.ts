'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage } from '@/lib/api-error';
import { toast } from '@/lib/toast';
import { ENTITY_NAMES, TOAST_MESSAGES } from '@/shared/constants/toast-messages';
import { createEmployeeGrade } from '../api/create-employee-grade';
import { EMPLOYEE_GRADE_QUERY_KEYS } from './use-employee-grades';

export function useCreateEmployeeGrade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createEmployeeGrade,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EMPLOYEE_GRADE_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: EMPLOYEE_GRADE_QUERY_KEYS.infinite() });
      toast.success({ title: TOAST_MESSAGES.SUCCESS.CREATED(ENTITY_NAMES.EMPLOYEE_GRADE) });
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error({ title: message });
    },
  });
}
