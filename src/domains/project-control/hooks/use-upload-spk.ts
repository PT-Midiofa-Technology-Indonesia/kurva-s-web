import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage, getFieldErrors } from '@/shared/lib/api-error';
import { toast } from '@/shared/lib/toast';
import { type UploadSPKParams, uploadSPK } from '../api/upload-spk';

export function useUploadSPK() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: UploadSPKParams) => uploadSPK(params),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project-boq', variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ['project', variables.projectId] });
      toast.success({ title: 'SPK berhasil diunggah.' });
    },
    onError: (error) => {
      const fieldErrors = getFieldErrors(error);
      toast.error({ title: fieldErrors?.file?.[0] ?? getErrorMessage(error) });
    },
  });
}
