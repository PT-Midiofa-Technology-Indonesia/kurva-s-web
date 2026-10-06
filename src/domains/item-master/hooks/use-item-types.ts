import { useQuery } from '@tanstack/react-query';
import { type GetItemTypesParams, getItemTypes } from '../api/get-item-types';

export const ITEM_TYPE_QUERY_KEYS = {
  all: ['item-types'] as const,
  lists: () => [...ITEM_TYPE_QUERY_KEYS.all, 'list'] as const,
  list: (filters: string) => [...ITEM_TYPE_QUERY_KEYS.lists(), { filters }] as const,
  details: () => [...ITEM_TYPE_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...ITEM_TYPE_QUERY_KEYS.details(), id] as const,
  infinite: () => ['item-types-infinite'] as const,
};

export function useItemTypes(params?: GetItemTypesParams) {
  return useQuery({
    queryKey: [...ITEM_TYPE_QUERY_KEYS.all, params],
    queryFn: () => getItemTypes(params),
    placeholderData: (previousData) => previousData,
  });
}
