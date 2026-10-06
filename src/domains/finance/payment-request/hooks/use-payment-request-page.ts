'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import type { GetPaymentRequestsParams } from '../api/get-payment-requests';
import { usePaymentRequests } from './use-payment-requests';

export interface UsePaymentRequestPageOptions {
  params?: GetPaymentRequestsParams;
  onUpdateQueryParam?: (key: string, value: string | undefined) => void;
  onSetQueryParams?: (params: Record<string, string | number | undefined>) => void;
}

export function usePaymentRequestPage(options?: UsePaymentRequestPageOptions) {
  const router = useRouter();
  const { data, isLoading, isError } = usePaymentRequests(options?.params);

  const paymentRequests = Array.isArray(data?.data) ? data.data : (data?.data?.items ?? []);
  const summary = Array.isArray(data?.data) ? undefined : data?.data?.summary;
  const totalItems = data?.meta?.total;
  const totalPages = data?.meta?.lastPage;

  const handleViewDetail = useCallback(
    (id: string) => {
      router.push(`/finance/payment-requests/${id}`);
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

  const handleSourceTypeChange = useCallback(
    (value: string | string[] | null | undefined) => {
      const v = Array.isArray(value) ? value[0] : value;
      options?.onUpdateQueryParam?.('sourceType', v || undefined);
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
    paymentRequests,
    summary,
    totalItems,
    totalPages,
    isLoading,
    isError,
    handleViewDetail,
    handleStatusChange,
    handleSourceTypeChange,
    handleSearchChange,
    handleSort,
    handlePaginationChange,
  };
}
