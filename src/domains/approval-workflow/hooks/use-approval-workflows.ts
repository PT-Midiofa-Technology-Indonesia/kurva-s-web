'use client';

import { useQuery } from '@tanstack/react-query';
import type { GetApprovalWorkflowsParams } from '../api/get-approval-workflows';
import { getApprovalWorkflows } from '../api/get-approval-workflows';

export const APPROVAL_WORKFLOW_QUERY_KEYS = {
  all: ['approval-workflows'] as const,
  lists: () => [...APPROVAL_WORKFLOW_QUERY_KEYS.all, 'list'] as const,
  list: (filters: string) => [...APPROVAL_WORKFLOW_QUERY_KEYS.lists(), { filters }] as const,
  details: () => [...APPROVAL_WORKFLOW_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...APPROVAL_WORKFLOW_QUERY_KEYS.details(), id] as const,
  approverOptions: (companyId?: string) =>
    [...APPROVAL_WORKFLOW_QUERY_KEYS.all, 'approver-options', companyId] as const,
};

export function useApprovalWorkflows(params?: GetApprovalWorkflowsParams) {
  return useQuery({
    queryKey: APPROVAL_WORKFLOW_QUERY_KEYS.list(JSON.stringify(params)),
    queryFn: () => getApprovalWorkflows(params),
    enabled: !!params?.companyId,
  });
}
