'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import type { GetOfficesParams } from '../api/get-offices';
import type { OfficeListItem } from '../types';
import { useDeleteOffice } from './use-delete-office';
import { useOffices } from './use-offices';

export interface UseOfficePageOptions {
  params?: GetOfficesParams;
  onUpdateQueryParam?: (key: string, value: string | undefined) => void;
  onSetQueryParams?: (params: Record<string, string | number | undefined>) => void;
}

export function useOfficePage(options?: UseOfficePageOptions) {
  const router = useRouter();
  const { data: officesData, isLoading, isError } = useOffices(options?.params);
  const { mutate: deleteOffice } = useDeleteOffice();
  const [deleteTarget, setDeleteTarget] = useState<OfficeListItem | null>(null);
  const [detailTarget, setDetailTarget] = useState<string | null>(null);
  const offices = officesData?.data || [];
  const totalItems = officesData?.meta?.total;
  const totalPages = officesData?.meta?.lastPage;

  const handleAdd = () => {
    router.push('/organization/office/create');
  };

  const handleEdit = (office: OfficeListItem) => {
    router.push(`/organization/office/${office.id}/edit`);
  };

  const handleDetail = (office: OfficeListItem) => {
    setDetailTarget(office.id);
  };

  const handleDetailClose = () => {
    setDetailTarget(null);
  };

  const handleDetailEdit = () => {
    if (detailTarget) {
      router.push(`/organization/office/${detailTarget}/edit`);
    }
  };

  const handleDetailSuccess = () => {
    setDetailTarget(null);
  };

  const handleDeleteClick = (office: OfficeListItem) => {
    setDeleteTarget(office);
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    deleteOffice(deleteTarget.id, {
      onSuccess: () => {
        setDeleteTarget(null);
      },
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
    offices,
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
