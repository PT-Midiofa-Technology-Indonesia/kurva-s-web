'use client';

import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import type {
  GetStockMaterialsParams,
  GetStockMaterialsResponse,
} from '../api/get-stock-materials';
import { getStockMaterials } from '../api/get-stock-materials';

export const STOCK_MATERIAL_QUERY_KEYS = {
  all: ['stock-materials'] as const,
  lists: () => [...STOCK_MATERIAL_QUERY_KEYS.all, 'list'] as const,
};

export function useStockMaterials(
  params?: GetStockMaterialsParams,
  companyId?: string,
  options?: Omit<
    UseQueryOptions<GetStockMaterialsResponse, Error, GetStockMaterialsResponse>,
    'queryKey' | 'queryFn'
  >
) {
  const { enabled, ...restOptions } = options ?? {};

  return useQuery({
    queryKey: [...STOCK_MATERIAL_QUERY_KEYS.all, params, companyId],
    queryFn: () => getStockMaterials(params, companyId),
    // Every request needs X-Company-Id — never fetch without a resolved company.
    enabled: (enabled ?? true) && !!companyId,
    ...restOptions,
  });
}
