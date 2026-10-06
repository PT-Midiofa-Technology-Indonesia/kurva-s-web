'use client';

import { useCallback, useState } from 'react';
import type { GetPoDraftsParams } from '../api/get-po-drafts';
import type { PoDraftItem } from '../types/po-draft';
import { useCancelPoDraft } from './use-cancel-po-draft';
import { usePoDrafts } from './use-po-drafts';

export interface UsePoDraftPageOptions {
  params: GetPoDraftsParams;
  onUpdateQueryParam?: (key: string, value: string | undefined) => void;
  onSetQueryParams?: (params: Record<string, string | number | undefined>) => void;
}

export function usePoDraftPage(options: UsePoDraftPageOptions) {
  const { data, isLoading, isError } = usePoDrafts(options.params);
  const companyId = (options.params.companyId as string) ?? '';
  const { mutate: cancelItem, isPending: isCancelling } = useCancelPoDraft({ companyId });

  const items = data?.data ?? [];
  const totalItems = data?.meta?.total ?? 0;
  const totalPages = data?.meta?.lastPage ?? 1;

  const [deleteTarget, setDeleteTarget] = useState<PoDraftItem | null>(null);

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

  const handleDeleteClick = useCallback((item: PoDraftItem) => {
    setDeleteTarget(item);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (!deleteTarget) return;
    cancelItem(deleteTarget.id, {
      onSuccess: () => {
        setDeleteTarget(null);
      },
    });
  }, [deleteTarget, cancelItem]);

  return {
    items,
    totalItems,
    totalPages,
    isLoading,
    isError,
    handleSearchChange,
    handleSort,
    handlePaginationChange,
    deleteTarget,
    setDeleteTarget,
    handleDeleteClick,
    handleDeleteConfirm,
    isCancelling,
  };
}
