'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadBillingDocument } from '../api';
import { BILLINGS_QUERY_KEYS } from './use-billings';

export function useUploadBillingDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadBillingDocument,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: BILLINGS_QUERY_KEYS.all });
      queryClient.invalidateQueries({
        queryKey: BILLINGS_QUERY_KEYS.documents(variables.billingId, variables.companyId),
      });
    },
  });
}
