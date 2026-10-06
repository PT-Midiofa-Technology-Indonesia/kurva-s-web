import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage } from '@/shared/lib/api-error';
import { toast } from '@/shared/lib/toast';
import { createSideInstruction } from '../api/create-side-instruction';

export function useCreateSideInstruction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: string) => createSideInstruction(projectId),
    onSuccess: (response, projectId) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      toast.success({ title: 'Site instruction berhasil dibuat.' });
      return response;
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error({ title: message });
    },
  });
}
