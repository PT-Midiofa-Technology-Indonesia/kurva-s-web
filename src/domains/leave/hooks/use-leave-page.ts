'use client';

import { useCallback, useState } from 'react';
import type { GetLeavesParams } from '../api/get-leaves';
import type { LeaveListItem } from '../types';
import { useCancelLeave } from './use-cancel-leave';
import { useLeaves } from './use-leaves';

export interface UseLeavePageOptions {
  params: GetLeavesParams;
  onSetQueryParams?: (params: Record<string, string | number | undefined>) => void;
}

export function useLeavePage(options: UseLeavePageOptions) {
  const { data: leavesData, isLoading, isError } = useLeaves(options.params);
  const { mutate: cancelLeave } = useCancelLeave();

  const leaves = leavesData?.data ?? [];
  const totalItems = leavesData?.meta?.total ?? 0;
  const totalPages = leavesData?.meta?.lastPage ?? 1;

  const [detailTarget, setDetailTarget] = useState<string | null>(null);
  const [formDrawerEditId, setFormDrawerEditId] = useState<string | null>(null);
  const [formDrawerOpen, setFormDrawerOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<LeaveListItem | null>(null);

  const handleSearchChange = useCallback(
    (value: string | undefined) => {
      const search = value?.trim() || undefined;
      options.onSetQueryParams?.({ search, page: 1 });
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

  const handleEdit = useCallback((item: LeaveListItem) => {
    setFormDrawerEditId(item.id);
    setFormDrawerOpen(true);
  }, []);

  const handleDetail = useCallback((item: LeaveListItem) => {
    setDetailTarget(item.id);
  }, []);

  const handleDetailClose = useCallback(() => {
    setDetailTarget(null);
  }, []);

  const handleDetailEdit = useCallback(() => {
    if (!detailTarget) return;
    setFormDrawerEditId(detailTarget);
    setFormDrawerOpen(true);
    setDetailTarget(null);
  }, [detailTarget]);

  const handleFormDrawerClose = useCallback(() => {
    setFormDrawerEditId(null);
    setFormDrawerOpen(false);
  }, []);

  const handleFormDrawerSuccess = useCallback(() => {
    setDetailTarget(null);
    setFormDrawerEditId(null);
    setFormDrawerOpen(false);
  }, []);

  const handleCancelClick = useCallback((item: LeaveListItem) => {
    setCancelTarget(item);
  }, []);

  const handleCancelConfirm = useCallback(() => {
    if (!cancelTarget) return;

    cancelLeave(
      {
        id: cancelTarget.id,
        companyId: options.params.companyId ?? '',
      },
      {
        onSuccess: () => {
          setCancelTarget(null);
          setDetailTarget(null);
        },
      }
    );
  }, [cancelTarget, cancelLeave, options.params.companyId]);

  return {
    leaves,
    totalItems,
    totalPages,
    isLoading,
    isError,
    handleSearchChange,
    handleSort,
    handlePaginationChange,
    handleAdd,
    handleEdit,
    handleDetail,
    detailTarget,
    handleDetailClose,
    handleDetailEdit,
    formDrawerEditId,
    formDrawerOpen,
    handleFormDrawerClose,
    handleFormDrawerSuccess,
    cancelTarget,
    setCancelTarget,
    handleCancelClick,
    handleCancelConfirm,
  };
}
