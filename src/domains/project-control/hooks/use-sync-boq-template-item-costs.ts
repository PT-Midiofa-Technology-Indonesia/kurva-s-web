import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/shared/lib/toast';
import type { SyncBOQTemplateItemCostsPayload } from '../api/sync-boq-template-item-costs';
import { syncBOQTemplateItemCosts } from '../api/sync-boq-template-item-costs';

export function useSyncBOQTemplateItemCosts(templateId: string, itemId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SyncBOQTemplateItemCostsPayload) =>
      syncBOQTemplateItemCosts(templateId, itemId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boq-template-item-costs', templateId, itemId] });
      toast.success({ title: 'Biaya item berhasil disimpan.' });
    },
    onError: () => {
      // Error propagated to caller via mutateAsync
    },
  });
}
