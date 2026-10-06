'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { rejectApprovalRequest } from '../api/reject-approval-request';
import type { ApprovalDecisionPayload } from '../types';
import { APPROVAL_REQUEST_QUERY_KEYS } from './use-approval-requests';

export function useRejectApprovalRequest(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ApprovalDecisionPayload) => rejectApprovalRequest(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: APPROVAL_REQUEST_QUERY_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: APPROVAL_REQUEST_QUERY_KEYS.lists() });
    },
  });
}
