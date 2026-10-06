import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ENTITY_NAMES, TOAST_MESSAGES } from '@/shared/constants/toast-messages';
import { getErrorMessage } from '@/shared/lib/api-error';
import { toast } from '@/shared/lib/toast';
import { type SyncBOQTemplatesPayload, syncBOQTemplates } from '../api/sync-boq-templates';
import { BOQ_TEMPLATES_QUERY_KEYS } from './use-boq-templates';

export function useSyncBOQTemplates() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SyncBOQTemplatesPayload) => syncBOQTemplates(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOQ_TEMPLATES_QUERY_KEYS.all });
      toast.success({ title: TOAST_MESSAGES.SUCCESS.UPDATED(ENTITY_NAMES.BOQ_TEMPLATE) });
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      console.log('message', message);

      toast.error({ title: message });
    },
  });
}
