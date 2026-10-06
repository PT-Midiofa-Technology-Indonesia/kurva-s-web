import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ENTITY_NAMES, TOAST_MESSAGES } from '@/shared/constants/toast-messages';
import { getErrorMessage } from '@/shared/lib/api-error';
import { toast } from '@/shared/lib/toast';
import { deleteBOQTemplate } from '../api/delete-boq-template';
import { BOQ_TEMPLATES_QUERY_KEYS } from './use-boq-templates';

export function useDeleteBOQTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (templateId: string) => deleteBOQTemplate(templateId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOQ_TEMPLATES_QUERY_KEYS.all });
      toast.success({ title: TOAST_MESSAGES.SUCCESS.DELETED(ENTITY_NAMES.BOQ_TEMPLATE) });
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error({ title: message });
    },
  });
}
