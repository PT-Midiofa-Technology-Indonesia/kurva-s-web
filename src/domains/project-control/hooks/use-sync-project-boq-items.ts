import { useMutation, useQueryClient } from '@tanstack/react-query';
import { TOAST_MESSAGES } from '@/shared/constants/toast-messages';
import { getErrorMessage } from '@/shared/lib/api-error';
import { toast } from '@/shared/lib/toast';
import {
  type SyncProjectBOQItemsPayload,
  syncProjectBOQItems,
} from '../api/sync-project-boq-items';
import { PROJECT_BOQ_QUERY_KEYS } from './use-project-boq';
import { PROJECT_BOQ_CATALOG_PRICES_QUERY_KEYS } from './use-project-boq-catalog-prices';

export function useSyncProjectBOQItems(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SyncProjectBOQItemsPayload) => syncProjectBOQItems(projectId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: PROJECT_BOQ_QUERY_KEYS.detail(projectId),
      });
      queryClient.invalidateQueries({
        queryKey: PROJECT_BOQ_CATALOG_PRICES_QUERY_KEYS.detail(projectId),
      });
      toast.success({ title: TOAST_MESSAGES.SUCCESS.UPDATED('BOQ Project') });
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error({ title: message });
    },
  });
}
