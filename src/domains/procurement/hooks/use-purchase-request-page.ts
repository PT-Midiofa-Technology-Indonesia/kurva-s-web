'use client';

import { useCallback, useState } from 'react';
import type { DeletePurchaseRequestParams } from '../api/delete-purchase-request';
import type { GetPurchaseRequestsParams } from '../api/get-purchase-requests';
import type { PurchaseRequestItem } from '../types';
import { useDeletePurchaseRequest } from './use-delete-purchase-request';
import { usePurchaseRequests } from './use-purchase-requests';

export interface UsePurchaseRequestPageOptions {
  params: GetPurchaseRequestsParams;
  onUpdateQueryParam?: (key: string, value: string | undefined) => void;
  onSetQueryParams?: (params: Record<string, string | number | undefined>) => void;
}

export function usePurchaseRequestPage(options: UsePurchaseRequestPageOptions) {
  const { data, isLoading, isError } = usePurchaseRequests(options.params);
  const { mutate: deleteItem, isPending: isDeleting } = useDeletePurchaseRequest();

  const items = data?.data ?? [];
  const totalItems = data?.meta?.total ?? 0;
  const totalPages = data?.meta?.lastPage ?? 1;

  // Delete dialog state
  const [deleteTarget, setDeleteTarget] = useState<PurchaseRequestItem | null>(null);

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

  const handleDeleteClick = useCallback((item: PurchaseRequestItem) => {
    setDeleteTarget(item);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (!deleteTarget) return;

    const params: DeletePurchaseRequestParams = {
      id: deleteTarget.id,
      companyId: options.params.companyId ?? '',
    };

    deleteItem(params, {
      onSuccess: () => {
        setDeleteTarget(null);
      },
    });
  }, [deleteTarget, deleteItem, options.params.companyId]);

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
    isDeleting,
  };
}
