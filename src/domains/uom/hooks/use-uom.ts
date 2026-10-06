import { useQuery } from '@tanstack/react-query';
import { type GetUomResponse, getUom } from '../api/get-uom';
import { UOM_QUERY_KEYS } from './use-uoms';

export function useUom(id: string | undefined) {
  return useQuery<GetUomResponse>({
    queryKey: [...UOM_QUERY_KEYS.details(), id],
    queryFn: () => getUom(id!),
    enabled: !!id,
  });
}
