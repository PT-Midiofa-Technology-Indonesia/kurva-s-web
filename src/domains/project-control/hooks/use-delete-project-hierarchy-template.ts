import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { deleteProjectHierarchyTemplate as apiDeleteProjectHierarchyTemplate } from '../api/sync-project-hierarchy-templates';
import { PROJECT_HIERARCHY_TEMPLATE_LABELS } from '../constants';

const PROJECT_HIERARCHY_TEMPLATE_QUERY_KEY = 'project-hierarchy-templates';

export function useDeleteProjectHierarchyTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiDeleteProjectHierarchyTemplate({ items: [], deletedIds: [id] }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROJECT_HIERARCHY_TEMPLATE_QUERY_KEY] });
      toast.success(PROJECT_HIERARCHY_TEMPLATE_LABELS.FEEDBACK.DELETE_SUCCESS);
    },
    onError: (error) => {
      toast.error(PROJECT_HIERARCHY_TEMPLATE_LABELS.FEEDBACK.DELETE_FAILED, {
        description: error.message,
      });
    },
  });
}
