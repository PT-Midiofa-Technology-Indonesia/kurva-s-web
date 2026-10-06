'use client';

import { useQuery } from '@tanstack/react-query';
import { getProspectFeeSetting } from '../api/get-prospect-fee-setting';
import { PROSPECT_FEE_QUERY_KEYS } from './use-prospect-fees';

export function useProspectFeeSetting(id?: string | null, companyId?: string | null) {
  const isEnabled = !!id && !!companyId;

  return useQuery({
    queryKey: PROSPECT_FEE_QUERY_KEYS.settingDetail(id ?? '', companyId),
    queryFn: () => getProspectFeeSetting(id ?? '', companyId ?? undefined),
    enabled: isEnabled,
  });
}
