'use client';

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage } from '@/lib/api-error';
import { toast } from '@/lib/toast';
import { TOAST_MESSAGES } from '@/shared/constants/toast-messages';
import { createVendorItemCatalog } from '../api/create-vendor-item-catalog';
import { deleteVendorItemCatalog } from '../api/delete-vendor-item-catalog';
import type { GetVendorItemCatalogsParams } from '../api/get-vendor-item-catalogs';
import { getVendorItemCatalogs } from '../api/get-vendor-item-catalogs';
import { updateVendorItemCatalog } from '../api/update-vendor-item-catalog';

export const VENDOR_ITEM_CATALOG_QUERY_KEYS = {
  all: ['vendor-item-catalogs'] as const,
  lists: () => [...VENDOR_ITEM_CATALOG_QUERY_KEYS.all, 'list'] as const,
  list: (filters: string) => [...VENDOR_ITEM_CATALOG_QUERY_KEYS.lists(), { filters }] as const,
  details: () => [...VENDOR_ITEM_CATALOG_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...VENDOR_ITEM_CATALOG_QUERY_KEYS.details(), id] as const,
  infinite: () => ['vendor-item-catalogs-infinite'] as const,
};

export function useVendorItemCatalogs(params?: GetVendorItemCatalogsParams) {
  return useQuery({
    queryKey: [...VENDOR_ITEM_CATALOG_QUERY_KEYS.all, params],
    queryFn: () => getVendorItemCatalogs(params),
    placeholderData: (previousData) => previousData,
  });
}

export interface UseVendorItemCatalogsInfiniteOptions {
  vendorId?: string;
  isActive?: boolean;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  perPage?: number;
  enabled?: boolean;
}

export function useVendorItemCatalogsInfinite(options?: UseVendorItemCatalogsInfiniteOptions) {
  const perPage = options?.perPage ?? 20;

  return useInfiniteQuery({
    queryKey: [
      ...VENDOR_ITEM_CATALOG_QUERY_KEYS.infinite(),
      perPage,
      options?.vendorId,
      options?.isActive,
      options?.search,
      options?.sortBy,
      options?.sortOrder,
    ],
    queryFn: ({ pageParam }) =>
      getVendorItemCatalogs({
        vendorId: options?.vendorId,
        isActive: options?.isActive,
        search: options?.search,
        sortBy: options?.sortBy,
        sortOrder: options?.sortOrder,
        page: pageParam,
        perPage,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.currentPage < lastPage.meta.lastPage
        ? lastPage.meta.currentPage + 1
        : undefined,
    enabled: options?.enabled !== false,
  });
}

export function useCreateVendorItemCatalog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createVendorItemCatalog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VENDOR_ITEM_CATALOG_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: VENDOR_ITEM_CATALOG_QUERY_KEYS.infinite() });
      toast.success({ title: TOAST_MESSAGES.SUCCESS.CREATED('Item Catalog') });
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error({ title: message });
    },
  });
}

export function useUpdateVendorItemCatalog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Parameters<typeof updateVendorItemCatalog>[1];
    }) => updateVendorItemCatalog(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: VENDOR_ITEM_CATALOG_QUERY_KEYS.all });
      queryClient.invalidateQueries({
        queryKey: VENDOR_ITEM_CATALOG_QUERY_KEYS.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: VENDOR_ITEM_CATALOG_QUERY_KEYS.infinite() });
      toast.success({ title: TOAST_MESSAGES.SUCCESS.UPDATED('Item Catalog') });
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error({ title: message });
    },
  });
}

export function useDeleteVendorItemCatalog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteVendorItemCatalog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VENDOR_ITEM_CATALOG_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: VENDOR_ITEM_CATALOG_QUERY_KEYS.infinite() });
      toast.success({ title: TOAST_MESSAGES.SUCCESS.DELETED('Item Catalog') });
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error({ title: message });
    },
  });
}
