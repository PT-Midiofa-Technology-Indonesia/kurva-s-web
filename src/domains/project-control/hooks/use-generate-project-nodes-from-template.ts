import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { GenerateFromTemplatePayload } from '../api/generate-project-hierarchy-nodes-from-template';
import { generateProjectHierarchyNodesFromTemplate } from '../api/generate-project-hierarchy-nodes-from-template';

export function useGenerateProjectNodesFromTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: GenerateFromTemplatePayload) =>
      generateProjectHierarchyNodesFromTemplate(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: (error) => {
      toast.error('Gagal generate hierarki project', {
        description: error.message,
      });
    },
  });
}
