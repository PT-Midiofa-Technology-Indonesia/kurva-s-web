'use client';

import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import type {
  GetStockMovementsParams,
  GetStockMovementsResponse,
} from '../api/get-stock-movements';
import { getStockMovements } from '../api/get-stock-movements';

export const STOCK_MOVEMENT_QUERY_KEYS = {
  all: ['stock-movements'] as const,
  lists: () => [...STOCK_MOVEMENT_QUERY_KEYS.all, 'list'] as const,
};

export function useStockMovements(
  params?: GetStockMovementsParams,
  companyId?: string,
  options?: Omit<
    UseQueryOptions<GetStockMovementsResponse, Error, GetStockMovementsResponse>,
    'queryKey' | 'queryFn'
  >
) {
  const { enabled, ...restOptions } = options ?? {};

  return useQuery({
    queryKey: [...STOCK_MOVEMENT_QUERY_KEYS.all, params, companyId],
    queryFn: () => getStockMovements(params, companyId),
    // Every request needs X-Company-Id — never fetch without a resolved company.
    enabled: (enabled ?? true) && !!companyId,
    ...restOptions,
  });
}
