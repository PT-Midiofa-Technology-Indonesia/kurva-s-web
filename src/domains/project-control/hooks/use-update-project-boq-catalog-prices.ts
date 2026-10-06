'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/shared/lib/toast';
import {
  type UpdateBOQCatalogPricesPayload,
  updateProjectBOQCatalogPrices,
} from '../api/update-project-boq-catalog-prices';
import { PROJECT_BOQ_CATALOG_PRICES_QUERY_KEYS } from './use-project-boq-catalog-prices';

export function useUpdateProjectBOQCatalogPrices(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateBOQCatalogPricesPayload) =>
      updateProjectBOQCatalogPrices(projectId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: PROJECT_BOQ_CATALOG_PRICES_QUERY_KEYS.detail(projectId),
      });
      toast.success({ title: 'Resume prices berhasil diupdate.' });
    },
    onError: () => {
      // Error propagated to caller
    },
  });
}
