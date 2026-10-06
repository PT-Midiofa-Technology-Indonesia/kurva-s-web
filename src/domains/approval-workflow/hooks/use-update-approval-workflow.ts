'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ENTITY_NAMES, TOAST_MESSAGES } from '@/shared/constants/toast-messages';
import { getErrorMessage } from '@/shared/lib/api-error';
import { toast } from '@/shared/lib/toast';
import { updateApprovalWorkflow } from '../api/update-approval-workflow';
import type { UpdateApprovalWorkflowPayload } from '../types';
import { APPROVAL_WORKFLOW_QUERY_KEYS } from './use-approval-workflows';

export function useUpdateApprovalWorkflow(id: string, companyId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateApprovalWorkflowPayload) =>
      updateApprovalWorkflow(id, payload, companyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: APPROVAL_WORKFLOW_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: APPROVAL_WORKFLOW_QUERY_KEYS.detail(id) });
      toast.success({ title: TOAST_MESSAGES.SUCCESS.UPDATED(ENTITY_NAMES.APPROVAL_WORKFLOW) });
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error({ title: message });
    },
  });
}
