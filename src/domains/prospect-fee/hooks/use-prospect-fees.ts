'use client';

import { useQuery } from '@tanstack/react-query';
import { type GetProspectFeesParams, getProspectFees } from '../api/get-prospect-fees';

export const PROSPECT_FEE_QUERY_KEYS = {
  all: ['prospect-fee'] as const,
  fees: () => [...PROSPECT_FEE_QUERY_KEYS.all, 'fees'] as const,
  feeList: (params: string) => [...PROSPECT_FEE_QUERY_KEYS.fees(), { params }] as const,
  settings: () => [...PROSPECT_FEE_QUERY_KEYS.all, 'settings'] as const,
  settingList: (params: string) => [...PROSPECT_FEE_QUERY_KEYS.settings(), { params }] as const,
  detail: () => [...PROSPECT_FEE_QUERY_KEYS.all, 'detail'] as const,
  settingDetail: (id: string, companyId?: string | null) =>
    [...PROSPECT_FEE_QUERY_KEYS.detail(), id, companyId] as const,
};

export function useProspectFees(params?: GetProspectFeesParams) {
  const isEnabled = !!params?.companyId;

  return useQuery({
    queryKey: PROSPECT_FEE_QUERY_KEYS.feeList(JSON.stringify(params ?? {})),
    queryFn: () => getProspectFees(params),
    enabled: isEnabled,
  });
}
