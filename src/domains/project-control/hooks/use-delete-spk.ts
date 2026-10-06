import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage } from '@/shared/lib/api-error';
import { toast } from '@/shared/lib/toast';
import { type DeleteSPKParams, deleteSPK } from '../api/delete-spk';

export function useDeleteSPK() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: DeleteSPKParams) => deleteSPK(params),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project-boq', variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ['project', variables.projectId] });
      toast.success({ title: 'Dokumen SPK berhasil dihapus.' });
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error({ title: message });
    },
  });
}
