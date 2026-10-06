import { useQuery } from '@tanstack/react-query';
import { getWarehouse } from '../api/get-warehouse';
import { WAREHOUSE_QUERY_KEYS } from './use-warehouses';

export function useWarehouse(id: string) {
  return useQuery({
    queryKey: WAREHOUSE_QUERY_KEYS.detail(id),
    queryFn: () => getWarehouse(id),
    enabled: !!id,
  });
}
