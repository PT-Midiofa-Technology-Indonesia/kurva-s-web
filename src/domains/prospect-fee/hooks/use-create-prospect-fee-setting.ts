'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createProspectFeeSetting } from '../api/create-prospect-fee-setting';
import { PROSPECT_FEE_QUERY_KEYS } from './use-prospect-fees';

export function useCreateProspectFeeSetting(companyId?: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Parameters<typeof createProspectFeeSetting>[1]) =>
      createProspectFeeSetting(
        companyId ??
          (() => {
            throw new Error('Company ID is required');
          })(),
        payload
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROSPECT_FEE_QUERY_KEYS.settings() });
    },
  });
}
