import { useMutation, useQueryClient } from '@tanstack/react-query';
import { type CreateWarehousePayload, createWarehouse } from '../api/create-warehouse';
import { WAREHOUSE_QUERY_KEYS } from './use-warehouses';

export function useCreateWarehouse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateWarehousePayload) => createWarehouse(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WAREHOUSE_QUERY_KEYS.all });
    },
  });
}
