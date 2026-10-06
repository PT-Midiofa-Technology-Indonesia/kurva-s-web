import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import { type GetItemCategoriesParams, getItemCategories } from '../api/get-item-categories';

export const ITEM_CATEGORY_QUERY_KEYS = {
  all: ['item-categories'] as const,
  lists: () => [...ITEM_CATEGORY_QUERY_KEYS.all, 'list'] as const,
  list: (filters: string) => [...ITEM_CATEGORY_QUERY_KEYS.lists(), { filters }] as const,
  details: () => [...ITEM_CATEGORY_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...ITEM_CATEGORY_QUERY_KEYS.details(), id] as const,
  infinite: () => ['item-categories-infinite'] as const,
};

export function useItemCategories(
  params?: GetItemCategoriesParams,
  options?: Pick<UseQueryOptions<Awaited<ReturnType<typeof getItemCategories>>>, 'enabled'>
) {
  return useQuery({
    queryKey: [...ITEM_CATEGORY_QUERY_KEYS.all, params],
    queryFn: () => getItemCategories(params),
    placeholderData: (previousData) => previousData,
    enabled: options?.enabled ?? true,
  });
}
