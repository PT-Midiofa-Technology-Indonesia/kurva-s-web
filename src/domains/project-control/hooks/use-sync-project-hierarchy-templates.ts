import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ENTITY_NAMES, TOAST_MESSAGES } from '@/shared/constants/toast-messages';
import { getErrorMessage } from '@/shared/lib/api-error';
import { toast } from '@/shared/lib/toast';
import {
  type SyncProjectHierarchyTemplatesPayload,
  syncProjectHierarchyTemplates,
} from '../api/sync-project-hierarchy-templates';
import { PROJECT_HIERARCHY_TEMPLATES_QUERY_KEYS } from './use-project-hierarchy-templates';

export function useSyncProjectHierarchyTemplates() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SyncProjectHierarchyTemplatesPayload) =>
      syncProjectHierarchyTemplates(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: PROJECT_HIERARCHY_TEMPLATES_QUERY_KEYS.all,
      });
      toast.success({
        title: TOAST_MESSAGES.SUCCESS.CREATED(ENTITY_NAMES.BOQ_TEMPLATE),
      });
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error({ title: message });
    },
  });
}
