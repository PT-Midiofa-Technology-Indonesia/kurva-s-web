'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import type { GetPaymentTypesParams } from '../api/get-payment-types';
import type { PaymentType } from '../types';
import { useDeletePaymentType } from './use-delete-payment-type';
import { usePaymentTypes } from './use-payment-types';

export interface UsePaymentTypePageOptions {
  params?: GetPaymentTypesParams;
  onUpdateQueryParam?: (key: string, value: string | undefined) => void;
  onSetQueryParams?: (params: Record<string, string | number | undefined>) => void;
}

export function usePaymentTypePage(options?: UsePaymentTypePageOptions) {
  const router = useRouter();
  const { data: paymentTypesData, isLoading, isError, refetch } = usePaymentTypes(options?.params);
  const { mutate: deletePaymentType } = useDeletePaymentType();
  const [deleteTarget, setDeleteTarget] = useState<PaymentType | null>(null);
  const [detailTarget, setDetailTarget] = useState<string | null>(null);

  const paymentTypes = paymentTypesData?.data || [];
  const totalItems = paymentTypesData?.meta?.total;
  const totalPages = paymentTypesData?.meta?.lastPage;

  const handleAdd = () => {
    router.push(`/master-data/payment-type/create`);
  };

  const handleEdit = (paymentType: PaymentType) => {
    router.push(`/master-data/payment-type/${paymentType.id}/edit`);
  };

  const handleDetail = (paymentType: PaymentType) => {
    setDetailTarget(paymentType.id);
  };

  const handleDetailClose = () => {
    setDetailTarget(null);
  };

  const handleDetailEdit = () => {
    if (detailTarget) {
      setDetailTarget(null);
      router.push(`/master-data/payment-type/${detailTarget}/edit`);
    }
  };

  const handleDetailSuccess = () => {
    refetch();
  };

  const handleDeleteClick = (paymentType: PaymentType) => {
    setDeleteTarget(paymentType);
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    deletePaymentType(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
    });
  };

  const handleIsActiveChange = useCallback(
    (value: string | string[] | null | undefined) => {
      const stringValue = Array.isArray(value) ? value[0] : value;
      if (stringValue === 'all' || !stringValue) {
        options?.onUpdateQueryParam?.('isActive', undefined);
      } else {
        options?.onUpdateQueryParam?.('isActive', stringValue);
      }
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
    paymentTypes,
    totalItems,
    totalPages,
    isLoading,
    isError,
    handleAdd,
    handleEdit,
    handleDetail,
    detailTarget,
    handleDetailClose,
    handleDetailEdit,
    handleDetailSuccess,
    deleteTarget,
    setDeleteTarget,
    handleDeleteClick,
    handleDeleteConfirm,
    handleIsActiveChange,
    handleSearchChange,
    handleSort,
    handlePaginationChange,
  };
}
