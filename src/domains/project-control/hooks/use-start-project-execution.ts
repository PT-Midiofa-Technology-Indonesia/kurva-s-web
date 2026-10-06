import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage } from '@/shared/lib/api-error';
import { toast } from '@/shared/lib/toast';
import { startProjectExecution } from '../api/start-project-execution';
import { PROJECT_BOQ_QUERY_KEYS } from './use-project-boq';

export function useStartProjectExecution(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => startProjectExecution(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: PROJECT_BOQ_QUERY_KEYS.detail(projectId),
      });
      toast.success({ title: 'Project execution berhasil dimulai.' });
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error({ title: message });
    },
  });
}
