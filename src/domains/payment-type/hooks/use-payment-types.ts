import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { type GetPaymentTypesParams, getPaymentTypes } from '../api/get-payment-types';

export const PAYMENT_TYPE_QUERY_KEYS = {
  all: ['payment-types'] as const,
  lists: () => [...PAYMENT_TYPE_QUERY_KEYS.all, 'list'] as const,
  list: (filters: string) => [...PAYMENT_TYPE_QUERY_KEYS.lists(), { filters }] as const,
  details: () => [...PAYMENT_TYPE_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...PAYMENT_TYPE_QUERY_KEYS.details(), id] as const,
  infinite: (params?: GetPaymentTypesParams) =>
    [...PAYMENT_TYPE_QUERY_KEYS.all, 'infinite', params] as const,
};

export function usePaymentTypes(params?: GetPaymentTypesParams) {
  return useQuery({
    queryKey: [...PAYMENT_TYPE_QUERY_KEYS.all, params],
    queryFn: () => getPaymentTypes(params),
    placeholderData: (previousData) => previousData,
  });
}

export function usePaymentTypesInfinite(params?: Omit<GetPaymentTypesParams, 'page'>) {
  return useInfiniteQuery({
    queryKey: PAYMENT_TYPE_QUERY_KEYS.infinite(params),
    queryFn: ({ pageParam = 1 }) =>
      getPaymentTypes({ ...params, page: pageParam as number, perPage: 20 }),
    getNextPageParam: (lastPage) => {
      if (lastPage.meta?.currentPage < (lastPage.meta?.lastPage ?? 0)) {
        return (lastPage.meta?.currentPage ?? 1) + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });
}
