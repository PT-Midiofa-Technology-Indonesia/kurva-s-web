'use client';

import { useCallback, useState } from 'react';
import type { DeleteOvertimeParams } from '../api/delete-overtime';
import type { GetOvertimesParams } from '../api/get-overtimes';
import type { OvertimeListItem } from '../types';
import { useDeleteOvertime } from './use-delete-overtime';
import { useOvertimes } from './use-overtimes';

export interface UseOvertimePageOptions {
  params: GetOvertimesParams;
  onUpdateQueryParam?: (key: string, value: string | undefined) => void;
  onSetQueryParams?: (params: Record<string, string | number | undefined>) => void;
}

export function useOvertimePage(options: UseOvertimePageOptions) {
  const { data: overtimesData, isLoading, isError } = useOvertimes(options.params);
  const { mutate: deleteOvertime } = useDeleteOvertime();

  const overtimes = overtimesData?.data ?? [];
  const totalItems = overtimesData?.meta?.total ?? 0;
  const totalPages = overtimesData?.meta?.lastPage ?? 1;

  // Edit/create drawer state
  const [formDrawerEditId, setFormDrawerEditId] = useState<string | null>(null);
  const [formDrawerOpen, setFormDrawerOpen] = useState(false);

  // Delete dialog state
  const [deleteTarget, setDeleteTarget] = useState<OvertimeListItem | null>(null);

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

  const handleAdd = useCallback(() => {
    setFormDrawerEditId(null);
    setFormDrawerOpen(true);
  }, []);

  const handleEdit = useCallback((item: OvertimeListItem) => {
    setFormDrawerEditId(item.id);
    setFormDrawerOpen(true);
  }, []);

  const handleFormDrawerClose = useCallback(() => {
    setFormDrawerOpen(false);
    setFormDrawerEditId(null);
  }, []);

  const handleFormDrawerSuccess = useCallback(() => {
    setFormDrawerOpen(false);
    setFormDrawerEditId(null);
  }, []);

  const handleDeleteClick = useCallback((item: OvertimeListItem) => {
    setDeleteTarget(item);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (!deleteTarget) return;

    const params: DeleteOvertimeParams = {
      id: deleteTarget.id,
      companyId: options.params.companyId ?? '',
    };

    deleteOvertime(params, {
      onSuccess: () => {
        setDeleteTarget(null);
      },
    });
  }, [deleteTarget, deleteOvertime, options.params.companyId]);

  return {
    overtimes,
    totalItems,
    totalPages,
    isLoading,
    isError,
    handleSearchChange,
    handleSort,
    handlePaginationChange,
    // Form drawer
    formDrawerEditId,
    formDrawerOpen,
    handleAdd,
    handleEdit,
    handleFormDrawerClose,
    handleFormDrawerSuccess,
    // Delete
    deleteTarget,
    setDeleteTarget,
    handleDeleteClick,
    handleDeleteConfirm,
  };
}
