'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { type UpdateBillingProgressParams, updateBillingProgress } from '../api';
import { BILLING_DETAIL_QUERY_KEYS } from './use-billing';
import { BILLING_PROGRESS_QUERY_KEYS } from './use-billing-progress';
import { BILLINGS_QUERY_KEYS } from './use-billings';

export function useUpdateBillingProgress(billingId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: Omit<UpdateBillingProgressParams, 'billingId'>) =>
      updateBillingProgress({ ...params, billingId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BILLINGS_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: BILLING_DETAIL_QUERY_KEYS.detail(billingId) });
      queryClient.invalidateQueries({
        queryKey: BILLING_PROGRESS_QUERY_KEYS.progress(billingId),
      });
    },
  });
}
