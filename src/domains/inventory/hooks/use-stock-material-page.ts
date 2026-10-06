'use client';

import { useCallback, useState } from 'react';
import type { GetStockMaterialsParams } from '../api/get-stock-materials';
import type { StockMaterialListItem } from '../types';
import { useStockMaterials } from './use-stock-materials';

export interface UseStockMaterialPageOptions {
  params?: GetStockMaterialsParams;
  companyId?: string;
  onUpdateQueryParam?: (key: string, value: string | undefined) => void;
  onSetQueryParams?: (params: Record<string, string | number | undefined>) => void;
}

export function useStockMaterialPage(options?: UseStockMaterialPageOptions) {
  const { data, isLoading, isError, refetch } = useStockMaterials(
    options?.params,
    options?.companyId
  );

  const [thresholdTarget, setThresholdTarget] = useState<StockMaterialListItem | null>(null);

  const materials = data?.data || [];
  const totalItems = data?.meta?.total;
  const totalPages = data?.meta?.lastPage;

  const handleThresholdClick = useCallback((item: StockMaterialListItem) => {
    setThresholdTarget(item);
  }, []);

  const handleThresholdClose = useCallback(() => {
    setThresholdTarget(null);
  }, []);

  const handleSearchChange = useCallback(
    (value: string | undefined) => {
      options?.onSetQueryParams?.({ search: value, page: 1 });
    },
    [options]
  );

  const handleWarehouseChange = useCallback(
    (value: string | string[] | null | undefined) => {
      const stringValue = Array.isArray(value) ? value[0] : value;
      // Clearing the filter means "all warehouses" — the param is dropped and
      // the backend returns one row per item per warehouse.
      options?.onSetQueryParams?.({
        warehouseId: !stringValue || stringValue === 'all' ? undefined : stringValue,
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
    materials,
    totalItems,
    totalPages,
    isLoading,
    isError,
    refetch,
    thresholdTarget,
    handleThresholdClick,
    handleThresholdClose,
    handleSearchChange,
    handleWarehouseChange,
    handleCompanyChange,
    handleSort,
    handlePaginationChange,
  };
}
