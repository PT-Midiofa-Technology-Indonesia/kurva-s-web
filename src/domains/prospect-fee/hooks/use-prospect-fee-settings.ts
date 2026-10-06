'use client';

import { useQuery } from '@tanstack/react-query';
import {
  type GetProspectFeeSettingsParams,
  getProspectFeeSettings,
} from '../api/get-prospect-fee-settings';
import { PROSPECT_FEE_QUERY_KEYS } from './use-prospect-fees';

export function useProspectFeeSettings(params?: GetProspectFeeSettingsParams) {
  const isEnabled = !!params?.companyId;

  return useQuery({
    queryKey: PROSPECT_FEE_QUERY_KEYS.settingList(JSON.stringify(params ?? {})),
    queryFn: () => getProspectFeeSettings(params),
    enabled: isEnabled,
  });
}
