'use client';

import { useQuery } from '@tanstack/react-query';
import { getDeliveryOrderItemTypes } from '../api/get-delivery-order-item-types';

export const DELIVERY_ORDER_ITEM_TYPES_QUERY_KEY = [
  'logistic',
  'delivery-order-item-types',
] as const;

export function useDeliveryOrderItemTypes(enabled = true) {
  return useQuery({
    queryKey: DELIVERY_ORDER_ITEM_TYPES_QUERY_KEY,
    queryFn: getDeliveryOrderItemTypes,
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}
