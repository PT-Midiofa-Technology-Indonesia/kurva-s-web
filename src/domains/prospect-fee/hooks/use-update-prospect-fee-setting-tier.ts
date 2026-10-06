'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateProspectFeeSettingTier } from '../api/update-prospect-fee-setting-tier';
import { PROSPECT_FEE_QUERY_KEYS } from './use-prospect-fees';

export function useUpdateProspectFeeSettingTier(settingId?: string, companyId?: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      tierId,
      ...payload
    }: Parameters<typeof updateProspectFeeSettingTier>[3] & { tierId: string }) =>
      updateProspectFeeSettingTier(
        settingId ??
          (() => {
            throw new Error('Setting ID is required');
          })(),
        tierId,
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
