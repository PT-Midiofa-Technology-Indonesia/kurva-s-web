'use client';

import { useQuery } from '@tanstack/react-query';
import { getPoDraftDetail } from '../api/get-po-draft-detail';
import type { PoDraftDetail } from '../types/api';
import { useCompanyId } from './use-company-id';
import { PO_DRAFT_QUERY_KEYS } from './use-po-draft-projects';

export function usePoDraftDetail(draftId: string | null) {
  const companyId = useCompanyId();
  return useQuery<PoDraftDetail>({
    queryKey: [...PO_DRAFT_QUERY_KEYS.detail(draftId ?? ''), companyId],
    queryFn: () => getPoDraftDetail(draftId!, companyId),
    enabled: !!draftId,
  });
}
