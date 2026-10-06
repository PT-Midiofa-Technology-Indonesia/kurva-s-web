'use client';

import { useQuery } from '@tanstack/react-query';
import {
  getPickupOrderAvailableEmployees,
  getPickupOrderDetail,
  getPickupOrderSelectableDeliveryOrders,
  getPickupOrders,
} from '../api';
import type { GetPickupOrderPickersParams, GetPickupOrdersParams } from '../types';

export const PICKUP_ORDER_QUERY_KEYS = {
  all: ['pickup-orders'] as const,
  lists: () => [...PICKUP_ORDER_QUERY_KEYS.all, 'list'] as const,
  list: (params: GetPickupOrdersParams) => [...PICKUP_ORDER_QUERY_KEYS.lists(), params] as const,
  details: () => [...PICKUP_ORDER_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string, companyId?: string | null) =>
    [...PICKUP_ORDER_QUERY_KEYS.details(), id, companyId] as const,
  pickers: () => [...PICKUP_ORDER_QUERY_KEYS.all, 'pickers'] as const,
  employees: (warehouseId: string, companyId?: string | null, search?: string) =>
    [...PICKUP_ORDER_QUERY_KEYS.pickers(), 'employees', warehouseId, companyId, search] as const,
  deliveryOrders: (companyId?: string | null, search?: string) =>
    [...PICKUP_ORDER_QUERY_KEYS.pickers(), 'delivery-orders', companyId, search] as const,
};

export function usePickupOrdersQuery(params: GetPickupOrdersParams) {
  return useQuery({
    queryKey: PICKUP_ORDER_QUERY_KEYS.list(params),
    queryFn: () => getPickupOrders(params),
    enabled: !!params.companyId,
    placeholderData: (previousData) => previousData,
  });
}

export function usePickupOrderDetailQuery(id: string, companyId?: string | null) {
  return useQuery({
    queryKey: PICKUP_ORDER_QUERY_KEYS.detail(id, companyId),
    queryFn: () => getPickupOrderDetail(id, companyId),
    enabled: !!id && !!companyId,
  });
}

export function usePickupOrderAvailableEmployeesQuery(
  warehouseId: string,
  params?: GetPickupOrderPickersParams,
  enabled = true
) {
  return useQuery({
    queryKey: PICKUP_ORDER_QUERY_KEYS.employees(warehouseId, params?.companyId, params?.search),
    queryFn: () => getPickupOrderAvailableEmployees(warehouseId, params),
    enabled: enabled && !!warehouseId && !!params?.companyId,
    placeholderData: (previousData) => previousData,
  });
}

export function usePickupOrderSelectableDeliveryOrdersQuery(
  params?: GetPickupOrderPickersParams,
  enabled = true
) {
  return useQuery({
    queryKey: PICKUP_ORDER_QUERY_KEYS.deliveryOrders(params?.companyId, params?.search),
    queryFn: () => getPickupOrderSelectableDeliveryOrders(params),
    enabled: enabled && !!params?.companyId,
    placeholderData: (previousData) => previousData,
  });
}
