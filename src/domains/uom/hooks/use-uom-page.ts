'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import type { GetUomsParams } from '../api/get-uoms';
import type { Uom } from '../types';
import { useDeleteUom } from './use-delete-uom';
import { useUoms } from './use-uoms';

export interface UseUomPageOptions {
  params?: GetUomsParams;
  onUpdateQueryParam?: (key: string, value: string | undefined) => void;
  onSetQueryParams?: (params: Record<string, string | number | undefined>) => void;
}

export function useUomPage(options?: UseUomPageOptions) {
  const router = useRouter();
  const { data: uomsData, isLoading, isError, refetch } = useUoms(options?.params);
  const { mutate: deleteUom } = useDeleteUom();
  const [deleteTarget, setDeleteTarget] = useState<Uom | null>(null);
  const [detailTarget, setDetailTarget] = useState<string | null>(null);

  const uoms = uomsData?.data || [];
  const totalItems = uomsData?.meta?.total;
  const totalPages = uomsData?.meta?.lastPage;

  const handleAdd = () => {
    router.push(`/master-data/uom/create`);
  };

  const handleEdit = (uom: Uom) => {
    router.push(`/master-data/uom/${uom.id}/edit`);
  };

  const handleDetail = (uom: Uom) => {
    setDetailTarget(uom.id);
  };

  const handleDetailClose = () => {
    setDetailTarget(null);
  };

  const handleDetailEdit = () => {
    if (detailTarget) {
      setDetailTarget(null);
      router.push(`/master-data/uom/${detailTarget}/edit`);
    }
  };

  const handleDetailSuccess = () => {
    refetch();
  };

  const handleDeleteClick = (uom: Uom) => {
    setDeleteTarget(uom);
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    deleteUom(deleteTarget.id, {
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

  const handleGroupChange = useCallback(
    (value: string | string[] | null | undefined) => {
      const stringValue = Array.isArray(value) ? value[0] : value;
      if (stringValue === 'all' || !stringValue) {
        options?.onUpdateQueryParam?.('group', undefined);
      } else {
        options?.onUpdateQueryParam?.('group', stringValue);
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
    uoms,
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
    handleGroupChange,
    handleSearchChange,
    handleSort,
    handlePaginationChange,
  };
}
