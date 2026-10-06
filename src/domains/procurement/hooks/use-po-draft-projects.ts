'use client';

import { useQuery } from '@tanstack/react-query';
import { getPoDraftProjects } from '../api/get-po-draft-projects';
import type { PoDraftProject } from '../types/api';
import { useCompanyId } from './use-company-id';

export const PO_DRAFT_QUERY_KEYS = {
  all: ['po-draft'] as const,
  projects: (type?: string) =>
    [...PO_DRAFT_QUERY_KEYS.all, 'projects', ...(type ? [type] : [])] as const,
  purchaseRequests: (projectId: string) =>
    [...PO_DRAFT_QUERY_KEYS.all, 'purchase-requests', projectId] as const,
  approvedPrItems: (projectId: string, type: string) =>
    [...PO_DRAFT_QUERY_KEYS.all, 'approved-items', projectId, type] as const,
  detail: (draftId: string) => [...PO_DRAFT_QUERY_KEYS.all, 'detail', draftId] as const,
};

export function usePoDraftProjects(type?: 'materialTool' | 'serviceRental') {
  const companyId = useCompanyId();
  return useQuery<PoDraftProject[]>({
    queryKey: [...PO_DRAFT_QUERY_KEYS.projects(type), companyId],
    queryFn: () => getPoDraftProjects(companyId, type),
    enabled: !!companyId,
  });
}
