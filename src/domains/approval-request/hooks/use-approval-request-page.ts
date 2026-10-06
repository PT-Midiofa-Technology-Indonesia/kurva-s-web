'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import type { GetApprovalRequestsParams } from '../api/get-approval-requests';
import { useApprovalRequests } from './use-approval-requests';

export interface UseApprovalRequestPageOptions {
  params?: GetApprovalRequestsParams;
  onUpdateQueryParam?: (key: string, value: string | undefined) => void;
  onSetQueryParams?: (params: Record<string, string | number | undefined>) => void;
}

export function useApprovalRequestPage(options?: UseApprovalRequestPageOptions) {
  const router = useRouter();
  const { data, isLoading, isError } = useApprovalRequests(options?.params);

  const approvalRequests = data?.data ?? [];
  const totalItems = data?.meta?.total;
  const totalPages = data?.meta?.lastPage;

  const handleViewDetail = useCallback(
    (id: string) => {
      router.push(`/approval-management/approval-request/${id}`);
    },
    [router]
  );

  const handleStatusChange = useCallback(
    (value: string | string[] | null | undefined) => {
      const v = Array.isArray(value) ? value[0] : value;
      options?.onUpdateQueryParam?.('status', v || undefined);
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
    approvalRequests,
    totalItems,
    totalPages,
    isLoading,
    isError,
    handleViewDetail,
    handleStatusChange,
    handleSearchChange,
    handleSort,
    handlePaginationChange,
  };
}
