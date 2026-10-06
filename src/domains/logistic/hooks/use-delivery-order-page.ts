'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import type { GetDeliveryOrdersParams } from '../api/get-delivery-orders';
import type { DeliveryOrderType } from '../types';
import { useDeliveryOrders } from './use-delivery-orders';

export interface UseDeliveryOrderPageOptions {
  type: DeliveryOrderType;
  params?: GetDeliveryOrdersParams;
  onUpdateQueryParam?: (key: string, value: string | undefined) => void;
  onSetQueryParams?: (params: Record<string, string | number | undefined>) => void;
}

export function useDeliveryOrderPage(options: UseDeliveryOrderPageOptions) {
  const router = useRouter();
  const { data, isLoading, isError } = useDeliveryOrders({
    ...options.params,
    type: options.type,
  } as GetDeliveryOrdersParams);

  const items = data?.data || [];
  const totalItems = data?.meta?.total;
  const totalPages = data?.meta?.lastPage;

  const handleAdd = useCallback(() => {
    const query = options.params?.companyId ? `?companyId=${options.params.companyId}` : '';
    router.push(`/logistic/delivery-order/create${query}`);
  }, [router, options.params?.companyId]);

  const handleSearchChange = useCallback(
    (value: string | undefined) => {
      options?.onSetQueryParams?.({ search: value, page: 1 });
    },
    [options]
  );

  const handleSort = useCallback(
    (sortBy: string, sortOrder: 'asc' | 'desc') => {
      options?.onSetQueryParams?.({ sortBy, sortOrder });
    },
    [options]
  );

  const handlePaginationChange = useCallback(
    (page: number, perPage: number) => {
      options?.onSetQueryParams?.({ page, perPage });
    },
    [options]
  );

  const handleFilterChange = useCallback(
    (key: string, value: string | undefined) => {
      options?.onUpdateQueryParam?.(key, value);
    },
    [options]
  );

  return {
    items,
    totalItems,
    totalPages,
    isLoading,
    isError,
    handleAdd,
    handleSearchChange,
    handleSort,
    handlePaginationChange,
    handleFilterChange,
  };
}
