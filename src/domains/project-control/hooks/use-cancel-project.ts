import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage } from '@/shared/lib/api-error';
import { toast } from '@/shared/lib/toast';
import { cancelProject } from '../api/cancel-project';

export function useCancelProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: string) => cancelProject(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success({ title: 'Project berhasil dibatalkan.' });
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error({ title: message });
    },
  });
}
