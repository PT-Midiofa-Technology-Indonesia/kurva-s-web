'use client';

import { useCallback, useState } from 'react';
import type { GetAssetRegistrationsParams } from '../api/get-asset-registrations';
import type { AssetRegistrationListItem } from '../types';
import { useAssetRegistrations } from './use-asset-registrations';

export interface UseAssetCatalogPageOptions {
  params?: GetAssetRegistrationsParams;
  onUpdateQueryParam?: (key: string, value: string | undefined) => void;
  onSetQueryParams?: (params: Record<string, string | number | undefined>) => void;
}

export function useAssetCatalogPage(options?: UseAssetCatalogPageOptions) {
  const {
    data: assetRegistrationsData,
    isLoading,
    isError,
  } = useAssetRegistrations(options?.params);

  const [detailTarget, setDetailTarget] = useState<string | null>(null);
  const [registerDrawerOpen, setRegisterDrawerOpen] = useState(false);

  const assetRegistrations = assetRegistrationsData?.data ?? [];
  const totalItems = assetRegistrationsData?.meta?.total ?? 0;
  const totalPages = assetRegistrationsData?.meta?.lastPage ?? 1;

  const handleSearchChange = useCallback(
    (value: string | undefined) => {
      options?.onSetQueryParams?.({ search: value?.trim() || undefined, page: 1 });
    },
    [options]
  );

  const handleStatusChange = useCallback(
    (value: string | string[] | null | undefined) => {
      const stringValue = Array.isArray(value) ? value[0] : value;
      if (!stringValue) {
        options?.onUpdateQueryParam?.('status', undefined);
        return;
      }
      options?.onUpdateQueryParam?.('status', stringValue);
    },
    [options]
  );

  const handleCategoryChange = useCallback(
    (value: string | string[] | null | undefined) => {
      const stringValue = Array.isArray(value) ? value[0] : value;
      if (!stringValue || stringValue === 'all') {
        options?.onUpdateQueryParam?.('categoryId', undefined);
        return;
      }
      options?.onUpdateQueryParam?.('categoryId', stringValue);
    },
    [options]
  );

  const handleWarehouseChange = useCallback(
    (value: string | string[] | null | undefined) => {
      const stringValue = Array.isArray(value) ? value[0] : value;
      if (!stringValue || stringValue === 'all') {
        options?.onUpdateQueryParam?.('warehouseId', undefined);
        return;
      }
      options?.onUpdateQueryParam?.('warehouseId', stringValue);
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

  const handleRegisterClick = useCallback(() => {
    if (!options?.params?.companyId) return;
    setRegisterDrawerOpen(true);
  }, [options?.params?.companyId]);

  const handleRegisterDrawerClose = useCallback(() => {
    setRegisterDrawerOpen(false);
  }, []);

  const handleDetail = useCallback((item: AssetRegistrationListItem) => {
    setDetailTarget(item.id);
  }, []);

  const handleDetailClose = useCallback(() => {
    setDetailTarget(null);
  }, []);

  return {
    assetRegistrations,
    totalItems,
    totalPages,
    isLoading,
    isError,
    detailTarget,
    handleDetail,
    handleDetailClose,
    registerDrawerOpen,
    handleRegisterClick,
    handleRegisterDrawerClose,
    handleSearchChange,
    handleStatusChange,
    handleCategoryChange,
    handleWarehouseChange,
    handleSort,
    handlePaginationChange,
  };
}
