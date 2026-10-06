'use client';

import { useQuery } from '@tanstack/react-query';
import { getProspects } from '../api/get-prospects';

export const PROSPECT_QUERY_KEYS = {
  pipeline: (companyId: string) => ['prospects', 'pipeline', companyId] as const,
  detail: (id: string) => ['prospects', 'detail', id] as const,
  stageHistory: (id: string) => ['prospects', 'stage-history', id] as const,
};

export function useProspects(companyId: string | undefined) {
  return useQuery({
    queryKey: PROSPECT_QUERY_KEYS.pipeline(companyId ?? ''),
    queryFn: () => getProspects({ companyId: companyId! }),
    enabled: !!companyId,
  });
}
