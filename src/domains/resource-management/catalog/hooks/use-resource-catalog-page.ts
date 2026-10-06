'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import type { GetResourceUnitsParams } from '../api/get-resource-units';
import type { ResourceUnit } from '../types';
import { useDeleteResourceUnit } from './use-delete-resource-unit';
import { useResourceUnits } from './use-resource-units';

export interface UseResourceCatalogPageOptions {
  params?: GetResourceUnitsParams;
  companyId?: string;
  onUpdateQueryParam?: (key: string, value: string | undefined) => void;
  onSetQueryParams?: (params: Record<string, string | number | undefined>) => void;
}

export function useResourceCatalogPage(options?: UseResourceCatalogPageOptions) {
  const {
    data: resourceUnitsData,
    isLoading,
    isError,
    refetch,
  } = useResourceUnits(options?.params, options?.companyId);
  const { mutate: deleteResourceUnit } = useDeleteResourceUnit(options?.companyId);
  const [deleteTarget, setDeleteTarget] = useState<ResourceUnit | null>(null);
  const [detailTarget, setDetailTarget] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const router = useRouter();

  const resourceUnits = resourceUnitsData?.data || [];
  const totalItems = resourceUnitsData?.meta?.total;
  const totalPages = resourceUnitsData?.meta?.lastPage;

  const handleAdd = useCallback(() => {
    setEditId(null);
    setDrawerOpen(true);
  }, []);

  const handleEdit = useCallback((resourceUnit: ResourceUnit) => {
    setEditId(resourceUnit.id);
    setDrawerOpen(true);
  }, []);

  const handleDrawerClose = useCallback(() => {
    setDrawerOpen(false);
    setEditId(null);
  }, []);

  const handleDrawerSuccess = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleDetail = useCallback((resourceUnit: ResourceUnit) => {
    setDetailTarget(resourceUnit.id);
  }, []);

  const handleDetailClose = useCallback(() => {
    setDetailTarget(null);
  }, []);

  const handleDetailEdit = useCallback(() => {
    if (detailTarget) {
      setDetailTarget(null);
      router.push(`/resource-management/catalog/${detailTarget}/edit`);
    }
  }, [detailTarget, router]);

  const handleDetailSuccess = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleDeleteClick = useCallback((resourceUnit: ResourceUnit) => {
    setDeleteTarget(resourceUnit);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (deleteTarget) {
      deleteResourceUnit(deleteTarget.id, {
        onSuccess: () => {
          setDeleteTarget(null);
          refetch();
        },
      });
    }
  }, [deleteTarget, deleteResourceUnit, refetch]);

  return {
    resourceUnits,
    isLoading,
    isError,
    totalItems,
    totalPages,
    deleteTarget,
    detailTarget,
    drawerOpen,
    editId,
    handleAdd,
    handleEdit,
    handleDrawerClose,
    handleDrawerSuccess,
    handleDetail,
    handleDetailClose,
    handleDetailEdit,
    handleDetailSuccess,
    handleDeleteClick,
    handleDeleteConfirm,
    setDeleteTarget,
    setDetailTarget,
  };
}
