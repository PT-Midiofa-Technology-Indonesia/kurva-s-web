'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { approveApprovalRequest } from '../api/approve-approval-request';
import type { ApprovalDecisionPayload } from '../types';
import { APPROVAL_REQUEST_QUERY_KEYS } from './use-approval-requests';

export function useApproveApprovalRequest(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ApprovalDecisionPayload) => approveApprovalRequest(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: APPROVAL_REQUEST_QUERY_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: APPROVAL_REQUEST_QUERY_KEYS.lists() });
    },
  });
}
