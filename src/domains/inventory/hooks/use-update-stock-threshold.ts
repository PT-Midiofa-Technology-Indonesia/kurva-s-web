'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateStockThreshold } from '../api/update-stock-threshold';
import type { UpdateStockThresholdPayload } from '../types';
import { STOCK_MATERIAL_QUERY_KEYS } from './use-stock-materials';

export function useUpdateStockThreshold(companyId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateStockThresholdPayload }) => {
      // X-Company-Id is mandatory — fail fast instead of sending a headerless request.
      if (!companyId) {
        return Promise.reject(new Error('companyId is required to update stock threshold'));
      }
      return updateStockThreshold(id, payload, companyId);
    },
    onSuccess: () => {
      // Thresholds drive the status badge, so the list has to be refetched.
      queryClient.invalidateQueries({ queryKey: STOCK_MATERIAL_QUERY_KEYS.all });
    },
  });
}
