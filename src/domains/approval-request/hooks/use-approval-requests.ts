'use client';

import { useQuery } from '@tanstack/react-query';
import type { GetApprovalRequestsParams } from '../api/get-approval-requests';
import { getApprovalRequests } from '../api/get-approval-requests';

export const APPROVAL_REQUEST_QUERY_KEYS = {
  all: ['approval-requests'] as const,
  lists: () => [...APPROVAL_REQUEST_QUERY_KEYS.all, 'list'] as const,
  list: (filters: string) => [...APPROVAL_REQUEST_QUERY_KEYS.lists(), { filters }] as const,
  details: () => [...APPROVAL_REQUEST_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...APPROVAL_REQUEST_QUERY_KEYS.details(), id] as const,
};

export function useApprovalRequests(params?: GetApprovalRequestsParams) {
  return useQuery({
    queryKey: APPROVAL_REQUEST_QUERY_KEYS.list(JSON.stringify(params)),
    queryFn: () => getApprovalRequests(params),
    enabled: !!params?.companyId,
  });
}
