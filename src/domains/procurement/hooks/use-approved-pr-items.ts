'use client';

import { useQuery } from '@tanstack/react-query';
import { getApprovedPrItems } from '../api/get-approved-pr-items';
import type { ApprovedPrItem } from '../types/api';
import { useCompanyId } from './use-company-id';
import { PO_DRAFT_QUERY_KEYS } from './use-po-draft-projects';

export interface UseApprovedPrItemsParams {
  projectId: string | null;
  type: 'materialTool' | 'serviceRental';
}

export function useApprovedPrItems({ projectId, type }: UseApprovedPrItemsParams) {
  const companyId = useCompanyId();
  return useQuery<ApprovedPrItem[]>({
    queryKey: [...PO_DRAFT_QUERY_KEYS.approvedPrItems(projectId ?? '', type), companyId],
    queryFn: () => getApprovedPrItems({ projectId: projectId!, type }, companyId),
    enabled: !!projectId,
  });
}
