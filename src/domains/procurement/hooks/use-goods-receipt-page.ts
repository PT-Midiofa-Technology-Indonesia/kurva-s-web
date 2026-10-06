'use client';

import { useCallback } from 'react';
import type { GetGoodsReceiptsParams } from '../api/get-goods-receipts';
import { useGoodsReceipts } from './use-goods-receipts';

export interface UseGoodsReceiptPageOptions {
  params: GetGoodsReceiptsParams;
  onUpdateQueryParam?: (key: string, value: string | undefined) => void;
  onSetQueryParams?: (params: Record<string, string | number | undefined>) => void;
}

export function useGoodsReceiptPage(options: UseGoodsReceiptPageOptions) {
  const { data, isLoading, isError } = useGoodsReceipts(options.params);

  const items = data?.data ?? [];
  const totalItems = data?.meta?.total ?? 0;
  const totalPages = data?.meta?.lastPage ?? 1;

  const handleSearchChange = useCallback(
    (value: string | undefined) => {
      options.onSetQueryParams?.({ search: value, page: 1 });
    },
    [options]
  );

  const handleSort = useCallback(
    (sortBy: string, sortOrder: 'asc' | 'desc') => {
      options.onSetQueryParams?.({ sortBy, sortOrder });
    },
    [options]
  );

  const handlePaginationChange = useCallback(
    (page: number, perPage: number) => {
      options.onSetQueryParams?.({ page, perPage });
    },
    [options]
  );

  return {
    items,
    totalItems,
    totalPages,
    isLoading,
    isError,
    handleSearchChange,
    handleSort,
    handlePaginationChange,
  };
}
