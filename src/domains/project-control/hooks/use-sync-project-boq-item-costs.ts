import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/shared/lib/toast';
import {
  type SyncProjectBOQItemCostsPayload,
  syncProjectBOQItemCosts,
} from '../api/sync-project-boq-item-costs';
import { PROJECT_BOQ_QUERY_KEYS } from './use-project-boq';
import { PROJECT_BOQ_CATALOG_PRICES_QUERY_KEYS } from './use-project-boq-catalog-prices';
import { PROJECT_BOQ_ITEM_COSTS_QUERY_KEYS } from './use-project-boq-item-costs';

export function useSyncProjectBOQItemCosts(projectId: string, itemId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SyncProjectBOQItemCostsPayload) =>
      syncProjectBOQItemCosts(projectId, itemId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: PROJECT_BOQ_ITEM_COSTS_QUERY_KEYS.detail(projectId, itemId),
      });
      queryClient.invalidateQueries({
        queryKey: PROJECT_BOQ_CATALOG_PRICES_QUERY_KEYS.detail(projectId),
      });
      queryClient.invalidateQueries({
        queryKey: PROJECT_BOQ_QUERY_KEYS.detail(projectId),
      });
      toast.success({ title: 'Biaya item berhasil disimpan.' });
    },
    onError: () => {
      // Error propagated to caller via mutateAsync
    },
  });
}
