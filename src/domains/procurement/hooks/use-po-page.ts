'use client';

import { useCallback, useState } from 'react';
import type { CancelPoParams } from '../api/cancel-purchase-order';
import type { GetPurchaseOrdersParams } from '../api/get-purchase-orders';
import type { IssuePoParams } from '../api/issue-purchase-order';
import type { PurchaseOrderItem } from '../types/purchase-order';
import { useCancelPurchaseOrder } from './use-cancel-purchase-order';
import { useIssuePurchaseOrder } from './use-issue-purchase-order';
import { usePurchaseOrders } from './use-purchase-orders';

export interface UsePoPageOptions {
  params: GetPurchaseOrdersParams;
  onUpdateQueryParam?: (key: string, value: string | undefined) => void;
  onSetQueryParams?: (params: Record<string, string | number | undefined>) => void;
}

export function usePoPage(options: UsePoPageOptions) {
  const { data, isLoading, isError } = usePurchaseOrders(options.params);
  const { mutate: issueItem, isPending: isIssuing } = useIssuePurchaseOrder();
  const { mutate: cancelItem, isPending: isCancelling } = useCancelPurchaseOrder();

  const items = data?.data ?? [];
  const totalItems = data?.meta?.total ?? 0;
  const totalPages = data?.meta?.lastPage ?? 1;

  // Issue confirm state
  const [issueTarget, setIssueTarget] = useState<PurchaseOrderItem | null>(null);

  // Cancel confirm state
  const [cancelTarget, setCancelTarget] = useState<PurchaseOrderItem | null>(null);

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

  // Issue
  const handleIssueClick = useCallback((item: PurchaseOrderItem) => {
    setIssueTarget(item);
  }, []);

  const handleIssueConfirm = useCallback(() => {
    if (!issueTarget) return;
    const params: IssuePoParams = {
      id: issueTarget.id,
      companyId: options.params.companyId ?? '',
    };
    issueItem(params, {
      onSuccess: () => {
        setIssueTarget(null);
      },
    });
  }, [issueTarget, issueItem, options.params.companyId]);

  // Cancel
  const handleCancelClick = useCallback((item: PurchaseOrderItem) => {
    setCancelTarget(item);
  }, []);

  const handleCancelConfirm = useCallback(() => {
    if (!cancelTarget) return;
    const params: CancelPoParams = {
      id: cancelTarget.id,
      companyId: options.params.companyId ?? '',
    };
    cancelItem(params, {
      onSuccess: () => {
        setCancelTarget(null);
      },
    });
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
    issueTarget,
    setIssueTarget,
    handleIssueClick,
    handleIssueConfirm,
    cancelTarget,
    setCancelTarget,
    handleCancelClick,
    handleCancelConfirm,
    isIssuing,
    isCancelling,
  };
}
