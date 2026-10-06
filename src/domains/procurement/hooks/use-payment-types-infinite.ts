'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import type { PaymentTypeListItem } from '@/domains/payment-type/types';
import { getApiPath } from '@/shared/lib/api-config';
import api from '@/shared/lib/axios';
import type { ApiPaginatedResponse } from '@/types/api';

export const PAYMENT_TYPES_QUERY_KEYS = {
  all: ['procurement-payment-types'] as const,
  infinite: (search?: string) => [...PAYMENT_TYPES_QUERY_KEYS.all, 'infinite', { search }] as const,
};

export function usePaymentTypesInfinite(options?: { search?: string; enabled?: boolean }) {
  return useInfiniteQuery({
    queryKey: PAYMENT_TYPES_QUERY_KEYS.infinite(options?.search),
    queryFn: async ({ pageParam = 1 }) => {
      const { data } = await api.get<ApiPaginatedResponse<PaymentTypeListItem[]>>(
        getApiPath('/payment-types'),
        {
          params: {
            page: pageParam,
            perPage: 20,
            search: options?.search,
          },
        }
      );
      return data;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.meta?.currentPage < (lastPage.meta?.lastPage ?? 0)) {
        return (lastPage.meta?.currentPage ?? 1) + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    enabled: options?.enabled ?? true,
  });
}
