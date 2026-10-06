'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import type { GetBillingsParams } from '../api/get-billings';
import { useBillings } from './use-billings';

export interface UseBillingPageOptions {
  params?: GetBillingsParams;
  onUpdateQueryParam?: (key: string, value: string | undefined) => void;
  onSetQueryParams?: (params: Record<string, string | number | undefined>) => void;
}

export function useBillingPage(options?: UseBillingPageOptions) {
  const router = useRouter();
  const { data, isLoading, isError } = useBillings(options?.params);

  const billings = data?.data ?? [];
  const totalItems = data?.meta?.total;
  const totalPages = data?.meta?.lastPage;

  const handleViewDetail = useCallback(
    (id: string) => {
      const companyId = options?.params?.companyId;
      router.push(`/finance/billings/${id}${companyId ? `?companyId=${companyId}` : ''}`);
    },
    [router, options?.params?.companyId]
  );

  const handleBillingTypeChange = useCallback(
    (value: string | string[] | null | undefined) => {
      const v = Array.isArray(value) ? value[0] : value;
      options?.onUpdateQueryParam?.('billingType', v || undefined);
    },
    [options]
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
    billings,
    totalItems,
    totalPages,
    isLoading,
    isError,
    handleViewDetail,
    handleBillingTypeChange,
    handleStatusChange,
    handleSearchChange,
    handleSort,
    handlePaginationChange,
  };
}
