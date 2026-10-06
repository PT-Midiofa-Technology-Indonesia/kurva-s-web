'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createProspectFeeSettingTier } from '../api/create-prospect-fee-setting-tier';
import { PROSPECT_FEE_QUERY_KEYS } from './use-prospect-fees';

export function useCreateProspectFeeSettingTier(settingId?: string, companyId?: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Parameters<typeof createProspectFeeSettingTier>[2]) =>
      createProspectFeeSettingTier(
        settingId ??
          (() => {
            throw new Error('Setting ID is required');
          })(),
        companyId ??
          (() => {
            throw new Error('Company ID is required');
          })(),
        payload
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: PROSPECT_FEE_QUERY_KEYS.settingDetail(settingId ?? '', companyId),
      });
    },
  });
}
