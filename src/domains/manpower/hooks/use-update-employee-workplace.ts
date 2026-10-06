'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getErrorMessage } from '@/lib/api-error';
import { toast } from '@/lib/toast';
import { TOAST_MESSAGES } from '@/shared/constants/toast-messages';

import { updateEmployeeWorkplace } from '../api/update-employee-workplace';
import { EMPLOYEE_WORKPLACE_QUERY_KEYS } from './use-employee-workplaces';

export function useUpdateEmployeeWorkplace(
  employeeId: string,
  workplaceId: string,
  companyId?: string
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      workplaceType: string;
      workplaceId: string;
      assignedAt: string;
      notes?: string | null;
      isActive?: boolean;
    }) => updateEmployeeWorkplace(employeeId, workplaceId, payload, companyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EMPLOYEE_WORKPLACE_QUERY_KEYS.all });
      toast.success({ title: TOAST_MESSAGES.SUCCESS.UPDATED('Workplace') });
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error({ title: message });
    },
  });
}
