'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import type { GetProjectCapabilitiesParams } from '../api/get-project-capabilities';
import type { ProjectCapability } from '../types';
import { useDeleteProjectCapability } from './use-delete-project-capability';
import { useProjectCapabilities } from './use-project-capabilities';

export interface UseProjectCapabilityPageOptions {
  params?: GetProjectCapabilitiesParams;
  onUpdateQueryParam?: (key: string, value: string | undefined) => void;
  onSetQueryParams?: (params: Record<string, string | number | undefined>) => void;
}

export function useProjectCapabilityPage(options?: UseProjectCapabilityPageOptions) {
  const router = useRouter();
  const {
    data: projectCapabilitiesData,
    isLoading,
    isError,
    refetch,
  } = useProjectCapabilities(options?.params);
  const { mutate: deleteProjectCapability } = useDeleteProjectCapability();
  const [deleteTarget, setDeleteTarget] = useState<ProjectCapability | null>(null);
  const [detailTarget, setDetailTarget] = useState<string | null>(null);

  const projectCapabilities = projectCapabilitiesData?.data || [];
  const totalItems = projectCapabilitiesData?.meta?.total;
  const totalPages = projectCapabilitiesData?.meta?.lastPage;

  const handleAdd = () => {
    router.push(`/master-data/project-capability/create`);
  };

  const handleEdit = (projectCapability: ProjectCapability) => {
    router.push(`/master-data/project-capability/${projectCapability.id}/edit`);
  };

  const handleDetail = (projectCapability: ProjectCapability) => {
    setDetailTarget(projectCapability.id);
  };

  const handleDetailClose = () => {
    setDetailTarget(null);
  };

  const handleDetailEdit = () => {
    if (detailTarget) {
      setDetailTarget(null);
      router.push(`/master-data/project-capability/${detailTarget}/edit`);
    }
  };

  const handleDetailSuccess = () => {
    refetch();
  };

  const handleDeleteClick = (projectCapability: ProjectCapability) => {
    setDeleteTarget(projectCapability);
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    deleteProjectCapability(deleteTarget.id, {
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
    projectCapabilities,
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
