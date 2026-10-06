'use client';

import { useCallback } from 'react';
import type { GetItemTypesParams } from '../api/get-item-types';
import { useItemTypes } from './use-item-types';

export interface UseItemTypeTabPageOptions {
  params?: GetItemTypesParams;
  onUpdateQueryParam?: (key: string, value: string | undefined) => void;
  onSetQueryParams?: (params: Record<string, string | number | undefined>) => void;
}

export function useItemTypeTabPage(options?: UseItemTypeTabPageOptions) {
  const { data: itemTypesData, isLoading, isError } = useItemTypes(options?.params);

  const itemTypes = itemTypesData?.data || [];
  const totalItems = itemTypesData?.meta?.total;
  const totalPages = itemTypesData?.meta?.lastPage;

  const handleSearchChange = useCallback(
    (value: string | undefined) => {
      options?.onSetQueryParams?.({ search: value, page: 1 });
    },
    [options]
  );

  const handleIsActiveChange = useCallback(
    (value: string | string[] | null | undefined) => {
      const stringValue = Array.isArray(value) ? value[0] : value;
      if (stringValue === 'all' || !stringValue) {
        options?.onUpdateQueryParam?.('isActive', undefined);
      } else {
        options?.onUpdateQueryParam?.('isActive', stringValue);
      }
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

  return {
    itemTypes,
    totalItems,
    totalPages,
    isLoading,
    isError,
    handleSearchChange,
    handleIsActiveChange,
    handleSort,
    handlePaginationChange,
  };
}
