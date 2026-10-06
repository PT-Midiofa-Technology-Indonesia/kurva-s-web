'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { saveBillingTax } from '../api';
import { BILLING_PAYMENT_DETAIL_QUERY_KEYS } from './use-billing-payment-detail';
import { BILLINGS_QUERY_KEYS } from './use-billings';

export function useSaveBillingTax() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveBillingTax,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: BILLINGS_QUERY_KEYS.all });
      queryClient.invalidateQueries({
        queryKey: BILLING_PAYMENT_DETAIL_QUERY_KEYS.detail(
          variables.billingId,
          variables.companyId
        ),
      });
    },
  });
}
