import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { syncProjectHierarchyTemplates } from '../api/sync-project-hierarchy-templates';
import { PROJECT_HIERARCHY_TEMPLATE_LABELS } from '../constants';
import type { ProjectHierarchyTemplateFormInput } from '../types';

const PROJECT_HIERARCHY_TEMPLATE_QUERY_KEY = 'project-hierarchy-templates';

export function useUpdateProjectHierarchyTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ProjectHierarchyTemplateFormInput) =>
      syncProjectHierarchyTemplates({ items: [payload], deletedIds: [] }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROJECT_HIERARCHY_TEMPLATE_QUERY_KEY] });
      toast.success(PROJECT_HIERARCHY_TEMPLATE_LABELS.FEEDBACK.UPDATE_SUCCESS);
    },
    onError: (error) => {
      toast.error(PROJECT_HIERARCHY_TEMPLATE_LABELS.FEEDBACK.UPDATE_FAILED, {
        description: error.message,
      });
    },
  });
}
