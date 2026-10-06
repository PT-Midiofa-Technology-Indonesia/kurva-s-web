'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getErrorMessage } from '@/lib/api-error';
import { toast } from '@/lib/toast';
import { TOAST_MESSAGES } from '@/shared/constants/toast-messages';

import { createEmployeeSkill } from '../api/create-employee-skill';
import { EMPLOYEE_SKILL_QUERY_KEYS } from './use-employee-skills';

export function useCreateEmployeeSkill(employeeId: string, companyId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { skillCatalogId: string; isActive: boolean }) =>
      createEmployeeSkill(employeeId, payload, companyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EMPLOYEE_SKILL_QUERY_KEYS.all });
      toast.success({ title: TOAST_MESSAGES.SUCCESS.CREATED('Skill') });
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error({ title: message });
    },
  });
}
