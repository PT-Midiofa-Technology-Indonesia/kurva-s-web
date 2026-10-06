'use client';

import { useCallback, useState } from 'react';
import type { DeleteAttendanceParams } from '../api/delete-attendance';
import type { GetAttendancesParams } from '../api/get-attendances';
import type { AttendanceListItem } from '../types';
import { useAttendances } from './use-attendances';
import { useDeleteAttendance } from './use-delete-attendance';

export interface UseAttendancePageOptions {
  params: GetAttendancesParams;
  onUpdateQueryParam?: (key: string, value: string | undefined) => void;
  onSetQueryParams?: (params: Record<string, string | number | undefined>) => void;
}

export function useAttendancePage(options: UseAttendancePageOptions) {
  const { data: attendancesData, isLoading, isError } = useAttendances(options.params);
  const { mutate: deleteAttendance } = useDeleteAttendance();

  const attendances = attendancesData?.data ?? [];
  const totalItems = attendancesData?.meta?.total ?? 0;
  const totalPages = attendancesData?.meta?.lastPage ?? 1;

  // Detail/Edit drawer state
  const [detailTarget, setDetailTarget] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<string | null>(null);

  // Delete dialog state
  const [deleteTarget, setDeleteTarget] = useState<AttendanceListItem | null>(null);

  const handleSearchChange = useCallback(
    (value: string | undefined) => {
      options.onSetQueryParams?.({ search: value, page: 1 });
    },
    [options]
  );

  const handleSort = useCallback(
    (sortBy: string, sortOrder: 'asc' | 'desc') => {
      options.onSetQueryParams?.({ sortBy, sortOrder });
    },
    [options]
  );

  const handlePaginationChange = useCallback(
    (page: number, perPage: number) => {
      options.onSetQueryParams?.({ page, perPage });
    },
    [options]
  );

  const handleDetail = useCallback((item: AttendanceListItem) => {
    setDetailTarget(item.id);
  }, []);

  const handleEdit = useCallback((item: AttendanceListItem) => {
    setEditTarget(item.id);
  }, []);

  const handleDetailClose = useCallback(() => {
    setDetailTarget(null);
  }, []);

  const handleEditClose = useCallback(() => {
    setEditTarget(null);
  }, []);

  const handleDetailEdit = useCallback(() => {
    if (detailTarget) {
      setEditTarget(detailTarget);
      setDetailTarget(null);
    }
  }, [detailTarget]);

  const handleDetailSuccess = useCallback(() => {
    setDetailTarget(null);
    setEditTarget(null);
  }, []);

  const handleDeleteClick = useCallback((item: AttendanceListItem) => {
    setDeleteTarget(item);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (!deleteTarget) return;

    const params: DeleteAttendanceParams = {
      id: deleteTarget.id,
      companyId: options.params.companyId ?? '',
    };

    deleteAttendance(params, {
      onSuccess: () => {
        setDeleteTarget(null);
      },
    });
  }, [deleteTarget, deleteAttendance, options.params.companyId]);

  return {
    attendances,
    totalItems,
    totalPages,
    isLoading,
    isError,
    handleSearchChange,
    handleSort,
    handlePaginationChange,
    // Detail
    detailTarget,
    editTarget,
    handleDetail,
    handleEdit,
    handleDetailClose,
    handleEditClose,
    handleDetailEdit,
    handleDetailSuccess,
    // Delete
    deleteTarget,
    setDeleteTarget,
    handleDeleteClick,
    handleDeleteConfirm,
  };
}
