import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteWarehouse } from '../api/delete-warehouse';
import { WAREHOUSE_QUERY_KEYS } from './use-warehouses';

export function useDeleteWarehouse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteWarehouse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WAREHOUSE_QUERY_KEYS.all });
    },
  });
}
