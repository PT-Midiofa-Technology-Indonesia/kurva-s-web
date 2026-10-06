'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import type { GetAssetCategoriesParams } from '../api/get-asset-categories';
import { ASSET_MANAGEMENT_ROUTES, getAssetCategoryEditRoute } from '../constants';
import type { AssetCategoryListItem } from '../types';
import { useAssetCategories } from './use-asset-categories';
import { useDeleteAssetCategory } from './use-delete-asset-category';

export interface UseAssetCategoryPageOptions {
  params?: GetAssetCategoriesParams;
  onUpdateQueryParam?: (key: string, value: string | undefined) => void;
  onSetQueryParams?: (params: Record<string, string | number | undefined>) => void;
}

export function useAssetCategoryPage(options?: UseAssetCategoryPageOptions) {
  const router = useRouter();
  const { data: assetCategoriesData, isLoading, isError } = useAssetCategories(options?.params);
  const { mutate: deleteAssetCategory, isPending: isDeleting } = useDeleteAssetCategory();

  const [deleteTarget, setDeleteTarget] = useState<AssetCategoryListItem | null>(null);
  const [detailTarget, setDetailTarget] = useState<string | null>(null);

  const assetCategories = assetCategoriesData?.data ?? [];
  const totalItems = assetCategoriesData?.meta?.total ?? 0;
  const totalPages = assetCategoriesData?.meta?.lastPage ?? 1;

  const handleAdd = useCallback(() => {
    router.push(ASSET_MANAGEMENT_ROUTES.ASSET_CATEGORY_CREATE);
  }, [router]);

  const handleEdit = useCallback(
    (item: AssetCategoryListItem) => {
      router.push(getAssetCategoryEditRoute(item.id));
    },
    [router]
  );

  const handleDetail = useCallback((item: AssetCategoryListItem) => {
    setDetailTarget(item.id);
  }, []);

  const handleDetailClose = useCallback(() => {
    setDetailTarget(null);
  }, []);

  const handleDetailEdit = useCallback(() => {
    if (!detailTarget) return;
    router.push(getAssetCategoryEditRoute(detailTarget));
    setDetailTarget(null);
  }, [detailTarget, router]);

  const handleDeleteClick = useCallback((item: AssetCategoryListItem) => {
    setDeleteTarget(item);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (!deleteTarget) return;
    deleteAssetCategory(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
    });
  }, [deleteAssetCategory, deleteTarget]);

  const handleSearchChange = useCallback(
    (value: string | undefined) => {
      options?.onSetQueryParams?.({ search: value?.trim() || undefined, page: 1 });
    },
    [options]
  );

  const handleIsActiveChange = useCallback(
    (value: string | string[] | null | undefined) => {
      const stringValue = Array.isArray(value) ? value[0] : value;
      if (!stringValue || stringValue === 'all') {
        options?.onUpdateQueryParam?.('isActive', undefined);
        return;
      }
      options?.onUpdateQueryParam?.('isActive', stringValue);
    },
    [options]
  );

  const handleDepreciationMethodChange = useCallback(
    (value: string | string[] | null | undefined) => {
      const stringValue = Array.isArray(value) ? value[0] : value;
      if (!stringValue || stringValue === 'all') {
        options?.onUpdateQueryParam?.('depreciationMethod', undefined);
        return;
      }
      options?.onUpdateQueryParam?.('depreciationMethod', stringValue);
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
    assetCategories,
    totalItems,
    totalPages,
    isLoading,
    isError,
    deleteTarget,
    setDeleteTarget,
    isDeleting,
    handleDeleteClick,
    handleDeleteConfirm,
    handleAdd,
    handleEdit,
    detailTarget,
    handleDetail,
    handleDetailClose,
    handleDetailEdit,
    handleSearchChange,
    handleIsActiveChange,
    handleDepreciationMethodChange,
    handleSort,
    handlePaginationChange,
  };
}
