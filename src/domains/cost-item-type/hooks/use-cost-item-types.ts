import { useQuery } from '@tanstack/react-query';
import { type GetCostItemTypesParams, getCostItemTypes } from '../api/get-cost-item-types';

export const COST_ITEM_TYPE_QUERY_KEYS = {
  all: ['cost-item-types'] as const,
  lists: () => [...COST_ITEM_TYPE_QUERY_KEYS.all, 'list'] as const,
  list: (filters: string) => [...COST_ITEM_TYPE_QUERY_KEYS.lists(), { filters }] as const,
  details: () => [...COST_ITEM_TYPE_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...COST_ITEM_TYPE_QUERY_KEYS.details(), id] as const,
};

export function useCostItemTypes(params?: GetCostItemTypesParams) {
  return useQuery({
    queryKey: [...COST_ITEM_TYPE_QUERY_KEYS.all, params],
    queryFn: () => getCostItemTypes(params),
    placeholderData: (previousData) => previousData,
  });
}
