'use client';

import { useQuery } from '@tanstack/react-query';
import { getApprovalWorkflow } from '../api/get-approval-workflow';
import { APPROVAL_WORKFLOW_QUERY_KEYS } from './use-approval-workflows';

export function useApprovalWorkflow(id: string | null, companyId?: string) {
  return useQuery({
    queryKey: APPROVAL_WORKFLOW_QUERY_KEYS.detail(id ?? ''),
    queryFn: () => getApprovalWorkflow(id!, companyId),
    enabled: !!id,
  });
}
