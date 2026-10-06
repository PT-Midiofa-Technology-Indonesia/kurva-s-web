'use client';

import { useQuery } from '@tanstack/react-query';
import { getProspectDetail } from '../api/get-prospect-detail';
import { PROSPECT_QUERY_KEYS } from './use-prospects';

export function useProspectDetail(projectId: string | null) {
  return useQuery({
    queryKey: PROSPECT_QUERY_KEYS.detail(projectId ?? ''),
    queryFn: () => getProspectDetail(projectId!),
    enabled: !!projectId,
  });
}
