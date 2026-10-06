'use client';

import { useQuery } from '@tanstack/react-query';

import { getCostItemType } from '../api/get-cost-item-type';
import { COST_ITEM_TYPE_QUERY_KEYS } from './use-cost-item-types';

export function useCostItemType(costItemTypeId: string) {
  return useQuery({
    queryKey: COST_ITEM_TYPE_QUERY_KEYS.detail(costItemTypeId),
    queryFn: () => getCostItemType(costItemTypeId),
    enabled: !!costItemTypeId,
    select: (data) => (data ? data.data : null),
  });
}
