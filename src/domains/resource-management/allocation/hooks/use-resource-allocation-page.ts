'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';

import type { GetResourceAllocationsParams } from '../api/get-resource-allocations';
import type { ResourceAllocation } from '../types';
import { useResourceAllocations } from './use-resource-allocations';

interface UseResourceAllocationPageOptions {
  params?: GetResourceAllocationsParams;
  projectId?: string;
  onUpdateQueryParam?: (key: string, value: string | number | boolean | undefined) => void;
  onSetQueryParams?: (values: any) => void;
}

export function useResourceAllocationPage(options?: UseResourceAllocationPageOptions) {
  const {
    data: allocationsData,
    isLoading,
    isError,
    refetch,
  } = useResourceAllocations(options?.params, options?.projectId);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [detailTarget, setDetailTarget] = useState<string | null>(null);
  const router = useRouter();

  const allocations = allocationsData?.data || [];
  const totalItems = allocationsData?.meta?.total;
  const totalPages = allocationsData?.meta?.lastPage;

  const handleAdd = useCallback(() => {
    setEditId(null);
    setDrawerOpen(true);
  }, []);

  const handleEdit = useCallback((allocation: ResourceAllocation) => {
    setEditId(allocation.id);
    setDrawerOpen(true);
  }, []);

  const handleDrawerClose = useCallback(() => {
    setDrawerOpen(false);
    setEditId(null);
  }, []);

  const handleDrawerSuccess = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleDetail = useCallback((allocation: ResourceAllocation) => {
    setDetailTarget(allocation.id);
  }, []);

  const openDetailById = useCallback((id: string) => {
    setDetailTarget(id);
  }, []);

  const handleDetailClose = useCallback(() => {
    setDetailTarget(null);
  }, []);

  const handleDetailEdit = useCallback(() => {
    if (detailTarget) {
      setDetailTarget(null);
      router.push(`/resource-management/allocation/${detailTarget}/edit`);
    }
  }, [detailTarget, router]);

  return {
    allocations,
    totalItems,
    totalPages,
    isLoading,
    isError,
    handleAdd,
    handleEdit,
    handleDetail,
    openDetailById,
    drawerOpen,
    editId,
    handleDrawerClose,
    handleDrawerSuccess,
    detailTarget,
    handleDetailClose,
    handleDetailEdit,
  };
}
