'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import type { GetCostItemTypesParams } from '../api/get-cost-item-types';
import type { CostItemType, CostItemTypeListItem } from '../types';
import { useCostItemTypes } from './use-cost-item-types';
import { useDeleteCostItemType } from './use-delete-cost-item-type';

export interface UseCostItemTypePageOptions {
  params?: GetCostItemTypesParams;
  onUpdateQueryParam?: (key: string, value: string | undefined) => void;
  onSetQueryParams?: (params: Record<string, string | number | undefined>) => void;
}

export function useCostItemTypePage(options?: UseCostItemTypePageOptions) {
  const router = useRouter();
  const {
    data: costItemTypesData,
    isLoading,
    isError,
    refetch,
  } = useCostItemTypes(options?.params);
  const { mutate: deleteCostItemType } = useDeleteCostItemType();
  const [deleteTarget, setDeleteTarget] = useState<CostItemTypeListItem | null>(null);
  const [detailTarget, setDetailTarget] = useState<string | null>(null);

  const costItemTypes = costItemTypesData?.data || [];
  const totalItems = costItemTypesData?.meta?.total;
  const totalPages = costItemTypesData?.meta?.lastPage;

  const handleAdd = () => {
    router.push(`/master-data/cost-item-type/create`);
  };

  const handleEdit = (costItemType: CostItemTypeListItem) => {
    router.push(`/master-data/cost-item-type/${costItemType.id}/edit`);
  };

  const handleDetail = (costItemType: CostItemType | CostItemTypeListItem) => {
    setDetailTarget(costItemType.id);
  };

  const handleDetailClose = () => {
    setDetailTarget(null);
  };

  const handleDetailEdit = () => {
    if (detailTarget) {
      setDetailTarget(null);
      router.push(`/master-data/cost-item-type/${detailTarget}/edit`);
    }
  };

  const handleDetailSuccess = () => {
    refetch();
  };

  const handleDeleteClick = (costItemType: CostItemTypeListItem) => {
    setDeleteTarget(costItemType);
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    deleteCostItemType(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
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
    costItemTypes,
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
