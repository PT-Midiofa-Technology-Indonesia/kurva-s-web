'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import type { GetVendorCatalogsParams } from '../api/get-vendor-catalogs';
import type { VendorCatalog } from '../types';
import { useDeleteVendorCatalog } from './use-delete-vendor-catalog';
import { useVendorCatalogs } from './use-vendor-catalogs';

export interface UseVendorCatalogPageOptions {
  params?: GetVendorCatalogsParams;
  onUpdateQueryParam?: (key: string, value: string | undefined) => void;
  onSetQueryParams?: (params: Record<string, string | number | undefined>) => void;
}

export function useVendorCatalogPage(options?: UseVendorCatalogPageOptions) {
  const router = useRouter();
  const { data: vendorsData, isLoading, isError } = useVendorCatalogs(options?.params);
  const { mutate: deleteVendorCatalog } = useDeleteVendorCatalog();
  const [deleteTarget, setDeleteTarget] = useState<VendorCatalog | null>(null);

  const vendors = vendorsData?.data || [];
  const totalItems = vendorsData?.meta?.total;
  const totalPages = vendorsData?.meta?.lastPage;

  const handleAdd = () => {
    router.push(`/vendor-management/vendor-catalog/create`);
  };

  const handleEdit = (vendor: VendorCatalog) => {
    router.push(`/vendor-management/vendor-catalog/${vendor.id}/edit`);
  };

  const handleDetail = (vendor: VendorCatalog) => {
    router.push(`/vendor-management/vendor-catalog/${vendor.id}/detail`);
  };

  const handleDeleteClick = (vendor: VendorCatalog) => {
    setDeleteTarget(vendor);
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    deleteVendorCatalog(deleteTarget.id, {
      onSuccess: () => {
        setDeleteTarget(null);
      },
    });
  };

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

  return {
    vendors,
    totalItems,
    totalPages,
    isLoading,
    isError,
    handleAdd,
    handleEdit,
    handleDetail,
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
