import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage } from '@/shared/lib/api-error';
import { toast } from '@/shared/lib/toast';
import type { SetWarehousePayload } from '../api/set-project-warehouse';
import { setProjectWarehouse } from '../api/set-project-warehouse';

export function useSetProjectWarehouse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, payload }: { projectId: string; payload: SetWarehousePayload }) =>
      setProjectWarehouse(projectId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success({ title: 'Warehouse berhasil dipilih.' });
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error({ title: message });
    },
  });
}
