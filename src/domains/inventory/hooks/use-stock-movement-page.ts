'use client';

import { useCallback } from 'react';
import type { GetStockMovementsParams } from '../api/get-stock-movements';
import { useStockMovements } from './use-stock-movements';

export interface UseStockMovementPageOptions {
  params?: GetStockMovementsParams;
  companyId?: string;
  onUpdateQueryParam?: (key: string, value: string | undefined) => void;
  onSetQueryParams?: (params: Record<string, string | number | undefined>) => void;
}

export function useStockMovementPage(options?: UseStockMovementPageOptions) {
  const { data, isLoading, isError, refetch } = useStockMovements(
    options?.params,
    options?.companyId
  );

  const movements = data?.data || [];
  const totalItems = data?.meta?.total;
  const totalPages = data?.meta?.lastPage;

  const handleSearchChange = useCallback(
    (value: string | undefined) => {
      options?.onSetQueryParams?.({ search: value, page: 1 });
    },
    [options]
  );

  const handleCompanyChange = useCallback(
    (value: string | string[] | null | undefined) => {
      const stringValue = Array.isArray(value) ? value[0] : value;
      if (stringValue) {
        options?.onSetQueryParams?.({ companyId: stringValue, warehouseId: undefined, page: 1 });
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

  const handleWarehouseChange = useCallback(
    (value: string | string[] | null | undefined) => {
      const stringValue = Array.isArray(value) ? value[0] : value;
      options?.onSetQueryParams?.({
        warehouseId: !stringValue || stringValue === 'all' ? undefined : stringValue,
        page: 1,
      });
    },
    [options]
  );

  const handleMovementTypeChange = useCallback(
    (value: string | string[] | null | undefined) => {
      const stringValue = Array.isArray(value) ? value[0] : value;
      options?.onSetQueryParams?.({
        movementType: !stringValue || stringValue === 'all' ? undefined : stringValue,
        page: 1,
      });
    },
    [options]
  );

  const handleDateRangeChange = useCallback(
    (startDate: string | undefined, endDate: string | undefined) => {
      options?.onSetQueryParams?.({ startDate, endDate, page: 1 });
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
    movements,
    totalItems,
    totalPages,
    isLoading,
    isError,
    refetch,
    handleSearchChange,
    handleCompanyChange,
    handleSort,
    handleWarehouseChange,
    handleMovementTypeChange,
    handleDateRangeChange,
    handlePaginationChange,
  };
}
