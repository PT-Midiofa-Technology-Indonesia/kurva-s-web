'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import type { GetJobItemTypesParams } from '../api/get-job-item-types';
import type { JobItemTypeListItem } from '../types';
import { useDeleteJobItemType } from './use-delete-job-item-type';
import { useJobItemTypes } from './use-job-item-types';

export interface UseJobItemTypePageOptions {
  params?: GetJobItemTypesParams;
  onUpdateQueryParam?: (key: string, value: string | undefined) => void;
  onSetQueryParams?: (params: Record<string, string | number | undefined>) => void;
}

export function useJobItemTypePage(options?: UseJobItemTypePageOptions) {
  const router = useRouter();
  const { data: jobItemTypesData, isLoading, isError, refetch } = useJobItemTypes(options?.params);
  const { mutate: deleteJobItemType } = useDeleteJobItemType();
  const [deleteTarget, setDeleteTarget] = useState<JobItemTypeListItem | null>(null);
  const [detailTarget, setDetailTarget] = useState<string | null>(null);

  const jobItemTypes = jobItemTypesData?.data || [];
  const totalItems = jobItemTypesData?.meta?.total;
  const totalPages = jobItemTypesData?.meta?.lastPage;

  const handleAdd = () => {
    router.push(`/master-data/job-item-type/create`);
  };

  const handleEdit = (jobItemType: JobItemTypeListItem) => {
    router.push(`/master-data/job-item-type/${jobItemType.id}/edit`);
  };

  const handleDetail = (jobItemType: JobItemTypeListItem) => {
    setDetailTarget(jobItemType.id);
  };

  const handleDetailClose = () => {
    setDetailTarget(null);
  };

  const handleDetailEdit = () => {
    if (detailTarget) {
      setDetailTarget(null);
      router.push(`/master-data/job-item-type/${detailTarget}/edit`);
    }
  };

  const handleDetailSuccess = () => {
    refetch();
  };

  const handleDeleteClick = (jobItemType: JobItemTypeListItem) => {
    setDeleteTarget(jobItemType);
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    deleteJobItemType(deleteTarget.id, {
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
    jobItemTypes,
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
