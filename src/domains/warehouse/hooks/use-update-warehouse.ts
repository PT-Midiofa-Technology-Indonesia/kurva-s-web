import { useMutation, useQueryClient } from '@tanstack/react-query';
import { type UpdateWarehousePayload, updateWarehouse } from '../api/update-warehouse';
import { WAREHOUSE_QUERY_KEYS } from './use-warehouses';

export function useUpdateWarehouse(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateWarehousePayload) => updateWarehouse(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WAREHOUSE_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: WAREHOUSE_QUERY_KEYS.detail(id) });
    },
  });
}
