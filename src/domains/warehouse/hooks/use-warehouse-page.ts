'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import type { GetWarehousesParams } from '../api/get-warehouses';
import type { WarehouseListItem } from '../types';
import { useDeleteWarehouse } from './use-delete-warehouse';
import { useWarehouses } from './use-warehouses';

export interface UseWarehousePageOptions {
  params?: GetWarehousesParams;
  onUpdateQueryParam?: (key: string, value: string | undefined) => void;
  onSetQueryParams?: (params: Record<string, string | number | undefined>) => void;
}

export function useWarehousePage(options?: UseWarehousePageOptions) {
  const router = useRouter();
  const { data: warehousesData, isLoading, isError, refetch } = useWarehouses(options?.params);
  const { mutate: deleteWarehouse } = useDeleteWarehouse();
  const [deleteTarget, setDeleteTarget] = useState<WarehouseListItem | null>(null);
  const [detailTarget, setDetailTarget] = useState<string | null>(null);

  const warehouses = warehousesData?.data || [];
  const totalItems = warehousesData?.meta?.total;
  const totalPages = warehousesData?.meta?.lastPage;

  const handleAdd = () => {
    router.push('/organization/warehouse/create');
  };

  const handleEdit = (warehouse: WarehouseListItem) => {
    router.push(`/organization/warehouse/${warehouse.id}/edit`);
  };

  const handleDetail = (warehouse: WarehouseListItem) => {
    setDetailTarget(warehouse.id);
  };

  const handleDetailClose = () => {
    setDetailTarget(null);
  };

  const handleDetailEdit = () => {
    if (detailTarget) {
      setDetailTarget(null);
      router.push(`/organization/warehouse/${detailTarget}/edit`);
    }
  };

  const handleDetailSuccess = () => {
    refetch();
  };

  const handleDeleteClick = (warehouse: WarehouseListItem) => {
    setDeleteTarget(warehouse);
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    deleteWarehouse(deleteTarget.id, {
      onSuccess: () => {
        setDeleteTarget(null);
      },
    });
  };

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

  return {
    warehouses,
    totalItems,
    totalPages,
    isLoading,
    isError,
    handleAdd,
    handleEdit,
    handleDetail,
    detailTarget,
    handleDetailClose,
    handleDetailEdit,
    handleDetailSuccess,
    deleteTarget,
    setDeleteTarget,
    handleDeleteClick,
    handleDeleteConfirm,
    handleIsActiveChange,
    handleSearchChange,
    handleSort,
    handlePaginationChange,
  };
}
