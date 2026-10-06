'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateBillingInformation } from '../api';
import { BILLING_PROJECT_DETAIL_QUERY_KEYS } from './use-billing-detail';
import { BILLINGS_QUERY_KEYS } from './use-billings';

export function useUpdateBillingInformation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateBillingInformation,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: BILLINGS_QUERY_KEYS.all });
      queryClient.invalidateQueries({
        queryKey: BILLING_PROJECT_DETAIL_QUERY_KEYS.detail(
          variables.billingId,
          variables.companyId
        ),
      });
    },
  });
}
