'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import type { GetPositionsParams } from '../api/get-positions';
import type { Position } from '../types';
import { useDeletePosition } from './use-delete-position';
import { usePositions } from './use-positions';

export interface UsePositionPageOptions {
  params?: GetPositionsParams;
  onUpdateQueryParam?: (key: string, value: string | undefined) => void;
  onSetQueryParams?: (params: Record<string, string | number | undefined>) => void;
}

export function usePositionPage(options?: UsePositionPageOptions) {
  const router = useRouter();
  const { data: positionsData, isLoading, isError, refetch } = usePositions(options?.params);
  const { mutate: deletePosition } = useDeletePosition();
  const [deleteTarget, setDeleteTarget] = useState<Position | null>(null);
  const [detailTarget, setDetailTarget] = useState<string | null>(null);

  const positions = positionsData?.data || [];
  const totalItems = positionsData?.meta?.total;
  const totalPages = positionsData?.meta?.lastPage;

  const handleAdd = () => {
    router.push('/master-data/position/create');
  };

  const handleEdit = (position: Position) => {
    router.push(`/master-data/position/${position.id}/edit`);
  };

  const handleDetail = (position: Position) => {
    setDetailTarget(position.id);
  };

  const handleDetailClose = () => {
    setDetailTarget(null);
  };

  const handleDetailEdit = () => {
    if (detailTarget) {
      setDetailTarget(null);
      router.push(`/master-data/position/${detailTarget}/edit`);
    }
  };

  const handleDetailSuccess = () => {
    refetch();
  };

  const handleDeleteClick = (position: Position) => {
    setDeleteTarget(position);
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    deletePosition(deleteTarget.id, {
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
    positions,
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
