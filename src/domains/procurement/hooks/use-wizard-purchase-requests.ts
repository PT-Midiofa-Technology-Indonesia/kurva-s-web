'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchWizardPurchaseRequests } from '../api/fetch-wizard-purchase-requests';
import type { PurchaseRequest } from '../types/api';
import { useCompanyId } from './use-company-id';
import { PO_DRAFT_QUERY_KEYS } from './use-po-draft-projects';

export function useWizardPurchaseRequests(projectId: string | null) {
  const companyId = useCompanyId();
  return useQuery<PurchaseRequest[]>({
    queryKey: [...PO_DRAFT_QUERY_KEYS.purchaseRequests(projectId ?? ''), companyId],
    queryFn: () => fetchWizardPurchaseRequests(projectId!, companyId),
    enabled: !!projectId,
  });
}
