'use client';

import { useQuery } from '@tanstack/react-query';
import { getApprovalRequest } from '../api/get-approval-request';
import { APPROVAL_REQUEST_QUERY_KEYS } from './use-approval-requests';

export function useApprovalRequest(id: string) {
  return useQuery({
    queryKey: APPROVAL_REQUEST_QUERY_KEYS.detail(id),
    queryFn: () => getApprovalRequest(id),
    enabled: !!id,
  });
}
