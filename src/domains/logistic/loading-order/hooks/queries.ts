'use client';

import { useQuery } from '@tanstack/react-query';
import {
  getLoadingOrderAvailableEquipment,
  getLoadingOrderAvailableMaterials,
  getLoadingOrderDetail,
  getLoadingOrderSelectableAllocations,
  getLoadingOrders,
} from '../api';
import type { GetLoadingOrderPickersParams, GetLoadingOrdersParams } from '../types';

export const LOADING_ORDER_QUERY_KEYS = {
  all: ['loading-orders'] as const,
  lists: () => [...LOADING_ORDER_QUERY_KEYS.all, 'list'] as const,
  list: (params: GetLoadingOrdersParams) => [...LOADING_ORDER_QUERY_KEYS.lists(), params] as const,
  details: () => [...LOADING_ORDER_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string, companyId?: string | null) =>
    [...LOADING_ORDER_QUERY_KEYS.details(), id, companyId] as const,
  pickers: () => [...LOADING_ORDER_QUERY_KEYS.all, 'pickers'] as const,
  materials: (warehouseId: string, companyId?: string | null, search?: string) =>
    [...LOADING_ORDER_QUERY_KEYS.pickers(), 'materials', warehouseId, companyId, search] as const,
  equipment: (warehouseId: string, companyId?: string | null, search?: string) =>
    [...LOADING_ORDER_QUERY_KEYS.pickers(), 'equipment', warehouseId, companyId, search] as const,
  allocations: (companyId?: string | null, search?: string) =>
    [...LOADING_ORDER_QUERY_KEYS.pickers(), 'allocations', companyId, search] as const,
};

export function useLoadingOrdersQuery(params: GetLoadingOrdersParams) {
  return useQuery({
    queryKey: LOADING_ORDER_QUERY_KEYS.list(params),
    queryFn: () => getLoadingOrders(params),
    enabled: !!params.companyId,
    placeholderData: (previousData) => previousData,
  });
}

export function useLoadingOrderDetailQuery(id: string, companyId?: string | null) {
  return useQuery({
    queryKey: LOADING_ORDER_QUERY_KEYS.detail(id, companyId),
    queryFn: () => getLoadingOrderDetail(id, companyId),
    enabled: !!id && !!companyId,
  });
}

export function useLoadingOrderAvailableMaterialsQuery(
  warehouseId: string,
  params?: GetLoadingOrderPickersParams,
  enabled = true
) {
  return useQuery({
    queryKey: LOADING_ORDER_QUERY_KEYS.materials(warehouseId, params?.companyId, params?.search),
    queryFn: () => getLoadingOrderAvailableMaterials(warehouseId, params),
    enabled: enabled && !!warehouseId && !!params?.companyId,
    placeholderData: (previousData) => previousData,
  });
}

export function useLoadingOrderAvailableEquipmentQuery(
  warehouseId: string,
  params?: GetLoadingOrderPickersParams,
  enabled = true
) {
  return useQuery({
    queryKey: LOADING_ORDER_QUERY_KEYS.equipment(warehouseId, params?.companyId, params?.search),
    queryFn: () => getLoadingOrderAvailableEquipment(warehouseId, params),
    enabled: enabled && !!warehouseId && !!params?.companyId,
    placeholderData: (previousData) => previousData,
  });
}

export function useLoadingOrderSelectableAllocationsQuery(
  params?: GetLoadingOrderPickersParams,
  enabled = true
) {
  return useQuery({
    queryKey: LOADING_ORDER_QUERY_KEYS.allocations(params?.companyId, params?.search),
    queryFn: () => getLoadingOrderSelectableAllocations(params),
    enabled: enabled && !!params?.companyId,
    placeholderData: (previousData) => previousData,
  });
}
