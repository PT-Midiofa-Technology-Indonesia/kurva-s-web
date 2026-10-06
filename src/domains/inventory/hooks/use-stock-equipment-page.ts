'use client';

import { useCallback } from 'react';
import type { GetStockEquipmentsParams } from '../api/get-stock-equipments';
import { useStockEquipments } from './use-stock-equipments';

export interface UseStockEquipmentPageOptions {
  params?: GetStockEquipmentsParams;
  companyId?: string;
  onUpdateQueryParam?: (key: string, value: string | undefined) => void;
  onSetQueryParams?: (params: Record<string, string | number | undefined>) => void;
}

export function useStockEquipmentPage(options?: UseStockEquipmentPageOptions) {
  const { data, isLoading, isError, refetch } = useStockEquipments(
    options?.params,
    options?.companyId
  );

  const equipments = data?.data || [];
  const totalItems = data?.meta?.total;
  const totalPages = data?.meta?.lastPage;

  const handleSearchChange = useCallback(
    (value: string | undefined) => {
      options?.onSetQueryParams?.({ search: value, page: 1 });
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

  const handleStatusChange = useCallback(
    (value: string | string[] | null | undefined) => {
      const stringValue = Array.isArray(value) ? value[0] : value;
      options?.onSetQueryParams?.({
        status: !stringValue || stringValue === 'all' ? undefined : stringValue,
        page: 1,
      });
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

  const handlePaginationChange = useCallback(
    (page: number, perPage: number) => {
      options?.onSetQueryParams?.({ page, perPage });
    },
    [options]
  );

  return {
    equipments,
    totalItems,
    totalPages,
    isLoading,
    isError,
    refetch,
    handleSearchChange,
    handleWarehouseChange,
    handleStatusChange,
    handleCompanyChange,
    handleSort,
    handlePaginationChange,
  };
}
