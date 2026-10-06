'use client';

import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import type {
  GetStockEquipmentsParams,
  GetStockEquipmentsResponse,
} from '../api/get-stock-equipments';
import { getStockEquipments } from '../api/get-stock-equipments';

export const STOCK_EQUIPMENT_QUERY_KEYS = {
  all: ['stock-equipments'] as const,
  lists: () => [...STOCK_EQUIPMENT_QUERY_KEYS.all, 'list'] as const,
};

export function useStockEquipments(
  params?: GetStockEquipmentsParams,
  companyId?: string,
  options?: Omit<
    UseQueryOptions<GetStockEquipmentsResponse, Error, GetStockEquipmentsResponse>,
    'queryKey' | 'queryFn'
  >
) {
  const { enabled, ...restOptions } = options ?? {};

  return useQuery({
    queryKey: [...STOCK_EQUIPMENT_QUERY_KEYS.all, params, companyId],
    queryFn: () => getStockEquipments(params, companyId),
    // Every request needs X-Company-Id — never fetch without a resolved company.
    enabled: (enabled ?? true) && !!companyId,
    ...restOptions,
  });
}
