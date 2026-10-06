'use client';

import { useCallback, useState } from 'react';
import { toast } from '@/shared/lib/toast';
import type { GetCostRequestsParams } from '../api/get-cost-requests';
import { COST_REQUEST_LABELS } from '../constants';
import type { CostRequest } from '../types';
import { useCancelCostRequest } from './use-cancel-cost-request';
import { useCostRequests } from './use-cost-requests';

export interface UseCostRequestListPageOptions {
  params: GetCostRequestsParams;
  onUpdateQueryParam?: (key: string, value: string | undefined) => void;
  onSetQueryParams?: (params: Record<string, string | number | undefined>) => void;
}

export function useCostRequestListPage(options: UseCostRequestListPageOptions) {
  const { data, isLoading, isError } = useCostRequests(options.params);
  const { mutate: cancelItem, isPending: isCancelling } = useCancelCostRequest();

  const items = data?.data ?? [];
  const totalItems = data?.meta?.total ?? 0;
  const totalPages = data?.meta?.lastPage ?? 1;

  const [cancelTarget, setCancelTarget] = useState<CostRequest | null>(null);

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

  const handleCancelClick = useCallback((item: CostRequest) => {
    setCancelTarget(item);
  }, []);

  const handleCancelConfirm = useCallback(() => {
    if (!cancelTarget) return;
    cancelItem(
      { id: cancelTarget.id, companyId: options.params.companyId },
      {
        onSuccess: (result) => {
          toast.error({ title: COST_REQUEST_LABELS.TOAST.cancelSuccess(result.code) });
          setCancelTarget(null);
        },
      }
    );
  }, [cancelTarget, cancelItem, options.params.companyId]);

  return {
    items,
    totalItems,
    totalPages,
    isLoading,
    isError,
    handleSearchChange,
    handleSort,
    handlePaginationChange,
    cancelTarget,
    setCancelTarget,
    handleCancelClick,
    handleCancelConfirm,
    isCancelling,
  };
}
