'use client';

import { useQuery } from '@tanstack/react-query';
import {
  type GetDeliveryOrdersParams,
  getDeliveryOrderDetail,
  getDeliveryOrders,
} from '../api/get-delivery-orders';

export const DELIVERY_ORDER_QUERY_KEYS = {
  all: ['delivery-orders'] as const,
  lists: () => [...DELIVERY_ORDER_QUERY_KEYS.all, 'list'] as const,
  list: (params: GetDeliveryOrdersParams) =>
    [...DELIVERY_ORDER_QUERY_KEYS.lists(), params] as const,
  details: () => [...DELIVERY_ORDER_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string, companyId?: string) =>
    [...DELIVERY_ORDER_QUERY_KEYS.details(), id, companyId] as const,
};

export function useDeliveryOrders(params: GetDeliveryOrdersParams) {
  return useQuery({
    queryKey: DELIVERY_ORDER_QUERY_KEYS.list(params),
    queryFn: () => getDeliveryOrders(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useDeliveryOrderDetail(id: string, companyId?: string) {
  return useQuery({
    queryKey: DELIVERY_ORDER_QUERY_KEYS.detail(id, companyId),
    queryFn: () => getDeliveryOrderDetail(id, companyId),
    enabled: !!id,
  });
}
