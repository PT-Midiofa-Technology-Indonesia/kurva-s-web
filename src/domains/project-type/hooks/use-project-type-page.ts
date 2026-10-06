'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import type { GetProjectTypesParams } from '../api/get-project-types';
import type { ProjectType } from '../types';
import { useDeleteProjectType } from './use-delete-project-type';
import { useProjectTypes } from './use-project-types';

export interface UseProjectTypePageOptions {
  params?: GetProjectTypesParams;
  onUpdateQueryParam?: (key: string, value: string | undefined) => void;
  onSetQueryParams?: (params: Record<string, string | number | undefined>) => void;
}

export function useProjectTypePage(options?: UseProjectTypePageOptions) {
  const router = useRouter();
  const { data: projectTypesData, isLoading, isError, refetch } = useProjectTypes(options?.params);
  const { mutate: deleteProjectType } = useDeleteProjectType();
  const [deleteTarget, setDeleteTarget] = useState<ProjectType | null>(null);
  const [detailTarget, setDetailTarget] = useState<string | null>(null);

  const projectTypes = projectTypesData?.data || [];
  const totalItems = projectTypesData?.meta?.total;
  const totalPages = projectTypesData?.meta?.lastPage;

  const handleAdd = () => {
    router.push(`/master-data/project-type/create`);
  };

  const handleEdit = (projectType: ProjectType) => {
    router.push(`/master-data/project-type/${projectType.id}/edit`);
  };

  const handleDetail = (projectType: ProjectType) => {
    setDetailTarget(projectType.id);
  };

  const handleDetailClose = () => {
    setDetailTarget(null);
  };

  const handleDetailEdit = () => {
    if (detailTarget) {
      setDetailTarget(null);
      router.push(`/master-data/project-type/${detailTarget}/edit`);
    }
  };

  const handleDetailSuccess = () => {
    refetch();
  };

  const handleDeleteClick = (projectType: ProjectType) => {
    setDeleteTarget(projectType);
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    deleteProjectType(deleteTarget.id, {
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
    projectTypes,
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
