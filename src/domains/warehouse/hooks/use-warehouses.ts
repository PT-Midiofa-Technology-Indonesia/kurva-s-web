import { useQuery } from '@tanstack/react-query';
import { type GetWarehousesParams, getWarehouses } from '../api/get-warehouses';

export const WAREHOUSE_QUERY_KEYS = {
  all: ['warehouses'] as const,
  lists: () => [...WAREHOUSE_QUERY_KEYS.all, 'list'] as const,
  list: (filters: string) => [...WAREHOUSE_QUERY_KEYS.lists(), { filters }] as const,
  details: () => [...WAREHOUSE_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...WAREHOUSE_QUERY_KEYS.details(), id] as const,
};

export function useWarehouses(params?: GetWarehousesParams) {
  return useQuery({
    queryKey: [...WAREHOUSE_QUERY_KEYS.all, params],
    queryFn: () => getWarehouses(params),
  });
}
