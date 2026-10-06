import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage } from '@/shared/lib/api-error';
import { toast } from '@/shared/lib/toast';
import type { SetWorkHoursPayload } from '../api/set-work-hours';
import { setWorkHours } from '../api/set-work-hours';

export function useSetWorkHours() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, payload }: { projectId: string; payload: SetWorkHoursPayload }) =>
      setWorkHours(projectId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success({ title: 'Jam kerja berhasil disimpan.' });
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error({ title: message });
    },
  });
}
