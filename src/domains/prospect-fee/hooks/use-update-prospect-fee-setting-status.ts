'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateProspectFeeSettingStatus } from '../api/update-prospect-fee-setting-status';
import { PROSPECT_FEE_QUERY_KEYS } from './use-prospect-fees';

export function useUpdateProspectFeeSettingStatus(companyId?: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { settingId: string; isActive: boolean }) =>
      updateProspectFeeSettingStatus(
        payload.settingId,
        companyId ??
          (() => {
            throw new Error('Company ID is required');
          })(),
        {
          isActive: payload.isActive,
        }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROSPECT_FEE_QUERY_KEYS.settings() });
    },
  });
}
