import { useMutation, useQueryClient } from '@tanstack/react-query';
import { TOAST_MESSAGES } from '@/shared/constants/toast-messages';
import { getErrorMessage } from '@/shared/lib/api-error';
import { toast } from '@/shared/lib/toast';
import {
  type SyncBOQTemplateItemsPayload,
  syncBOQTemplateItems,
} from '../api/sync-boq-template-items';
import { BOQ_TEMPLATE_QUERY_KEYS } from './use-boq-template';

export function useSyncBOQTemplateItems(templateId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SyncBOQTemplateItemsPayload) => syncBOQTemplateItems(templateId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: BOQ_TEMPLATE_QUERY_KEYS.detail(templateId),
      });
      toast.success({ title: TOAST_MESSAGES.SUCCESS.UPDATED('BOQ Template') });
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error({ title: message });
    },
  });
}
