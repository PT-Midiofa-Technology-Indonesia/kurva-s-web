'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { TOAST_MESSAGES } from '@/shared/constants/toast-messages';
import { getErrorMessage } from '@/shared/lib/api-error';
import { toast } from '@/shared/lib/toast';
import { type SetBOQLimitBudgetPayload, setBOQLimitBudget } from '../api/set-boq-limit-budget';
import { BOQ_PROJECT_QUERY_KEYS } from './use-boq-projects';
import { PROJECT_BOQ_QUERY_KEYS } from './use-project-boq';

export function useSetBOQLimitBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      payload,
    }: {
      projectId: string;
      payload: SetBOQLimitBudgetPayload;
    }) => setBOQLimitBudget(projectId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: BOQ_PROJECT_QUERY_KEYS.all });
      queryClient.invalidateQueries({
        queryKey: PROJECT_BOQ_QUERY_KEYS.detail(variables.projectId),
      });
      toast.success({ title: TOAST_MESSAGES.SUCCESS.UPDATED('Limit Budget') });
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error({ title: message });
    },
  });
}
