'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteBillingDocument } from '../api';
import { BILLINGS_QUERY_KEYS } from './use-billings';

export function useDeleteBillingDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBillingDocument,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: BILLINGS_QUERY_KEYS.documents(variables.billingId, variables.companyId),
      });
    },
  });
}
