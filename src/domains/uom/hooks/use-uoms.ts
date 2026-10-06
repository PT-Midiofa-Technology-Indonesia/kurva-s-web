import { useQuery } from '@tanstack/react-query';
import { type GetUomsParams, getUoms } from '../api/get-uoms';

export const UOM_QUERY_KEYS = {
  all: ['uoms'] as const,
  lists: () => [...UOM_QUERY_KEYS.all, 'list'] as const,
  list: (filters: string) => [...UOM_QUERY_KEYS.lists(), { filters }] as const,
  details: () => [...UOM_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...UOM_QUERY_KEYS.details(), id] as const,
  infinite: () => ['uoms-infinite'] as const,
};

export function useUoms(params?: GetUomsParams) {
  return useQuery({
    queryKey: [...UOM_QUERY_KEYS.all, params],
    queryFn: () => getUoms(params),
    placeholderData: (previousData) => previousData,
  });
}
