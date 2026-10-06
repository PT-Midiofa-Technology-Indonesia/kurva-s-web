'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import type { GetHierarchyManagementsParams } from '../api/get-hierarchy-managements';
import type { HierarchyManagementListItem } from '../types';
import { useDeleteHierarchyManagement } from './use-delete-hierarchy-management';
import { useHierarchyManagements } from './use-hierarchy-managements';

export interface UseHierarchyManagementPageOptions {
  params?: GetHierarchyManagementsParams;
  onUpdateQueryParam?: (key: string, value: string | undefined) => void;
  onSetQueryParams?: (params: Record<string, string | number | undefined>) => void;
}

export function useHierarchyManagementPage(options?: UseHierarchyManagementPageOptions) {
  const router = useRouter();
  const {
    data: hierarchyManagementsData,
    isLoading,
    isError,
    refetch,
  } = useHierarchyManagements(options?.params);
  const { mutate: deleteHierarchyManagement } = useDeleteHierarchyManagement();
  const [deleteTarget, setDeleteTarget] = useState<HierarchyManagementListItem | null>(null);
  const [detailTarget, setDetailTarget] = useState<string | null>(null);

  const hierarchyManagements = hierarchyManagementsData?.data || [];
  const totalItems = hierarchyManagementsData?.meta?.total;
  const totalPages = hierarchyManagementsData?.meta?.lastPage;

  const handleAdd = () => {
    const companyId = options?.params?.companyId;

    if (companyId) {
      router.push(`/organization/hierarchy/create?companyId=${encodeURIComponent(companyId)}`);
      return;
    }

    router.push('/organization/hierarchy/create');
  };

  const handleEdit = (item: HierarchyManagementListItem) => {
    router.push(`/organization/hierarchy/${item.id}/edit`);
  };

  const handleDetail = (item: HierarchyManagementListItem) => {
    setDetailTarget(item.id);
  };

  const handleDetailClose = () => {
    setDetailTarget(null);
  };

  const handleDetailEdit = () => {
    if (detailTarget) {
      const targetId = detailTarget;
      setDetailTarget(null);
      router.push(`/organization/hierarchy/${targetId}/edit`);
    }
  };

  const handleDetailSuccess = () => {
    refetch();
  };

  const handleDeleteClick = (item: HierarchyManagementListItem) => {
    setDeleteTarget(item);
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    deleteHierarchyManagement(deleteTarget.id, {
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
    hierarchyManagements,
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
