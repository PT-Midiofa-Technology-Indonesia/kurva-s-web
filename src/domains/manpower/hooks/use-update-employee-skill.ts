'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getErrorMessage } from '@/lib/api-error';
import { toast } from '@/lib/toast';
import { TOAST_MESSAGES } from '@/shared/constants/toast-messages';

import { updateEmployeeSkill } from '../api/update-employee-skill';
import { EMPLOYEE_SKILL_QUERY_KEYS } from './use-employee-skills';

export function useUpdateEmployeeSkill(employeeId: string, skillId: string, companyId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { skillCatalogId: string; isActive: boolean }) =>
      updateEmployeeSkill(employeeId, skillId, payload, companyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EMPLOYEE_SKILL_QUERY_KEYS.all });
      toast.success({ title: TOAST_MESSAGES.SUCCESS.UPDATED('Skill') });
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error({ title: message });
    },
  });
}
