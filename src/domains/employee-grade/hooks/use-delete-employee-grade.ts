'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage } from '@/lib/api-error';
import { toast } from '@/lib/toast';
import { ENTITY_NAMES, TOAST_MESSAGES } from '@/shared/constants/toast-messages';
import { deleteEmployeeGrade } from '../api/delete-employee-grade';
import { EMPLOYEE_GRADE_QUERY_KEYS } from './use-employee-grades';

export function useDeleteEmployeeGrade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteEmployeeGrade,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EMPLOYEE_GRADE_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: EMPLOYEE_GRADE_QUERY_KEYS.infinite() });
      toast.success({ title: TOAST_MESSAGES.SUCCESS.DELETED(ENTITY_NAMES.EMPLOYEE_GRADE) });
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error({ title: message });
    },
  });
}
