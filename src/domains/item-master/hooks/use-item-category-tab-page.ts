'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import type { GetItemCategoriesParams } from '../api/get-item-categories';
import type { ItemCategoryListItem } from '../types';
import { useDeleteItemCategory } from './use-delete-item-category';
import { useItemCategories } from './use-item-categories';

export interface UseItemCategoryTabPageOptions {
  params?: GetItemCategoriesParams;
  onUpdateQueryParam?: (key: string, value: string | undefined) => void;
  onSetQueryParams?: (params: Record<string, string | number | undefined>) => void;
}

export function useItemCategoryTabPage(options?: UseItemCategoryTabPageOptions) {
  const router = useRouter();
  const { data: itemCategoriesData, isLoading, isError } = useItemCategories(options?.params);
  const { mutate: deleteItemCategory, isPending: isDeleting } = useDeleteItemCategory();

  const [deleteTarget, setDeleteTarget] = useState<ItemCategoryListItem | null>(null);
  const [detailTarget, setDetailTarget] = useState<string | null>(null);

  const itemCategories = itemCategoriesData?.data || [];
  const totalItems = itemCategoriesData?.meta?.total;
  const totalPages = itemCategoriesData?.meta?.lastPage;

  const handleAdd = () => {
    router.push('/master-data/item-master/create?tab=item-category');
  };

  const handleEdit = (item: ItemCategoryListItem) => {
    router.push(`/master-data/item-master/${item.id}/edit?tab=item-category`);
  };

  const handleDetail = (item: ItemCategoryListItem) => {
    setDetailTarget(item.id);
  };

  const handleDetailClose = () => {
    setDetailTarget(null);
  };

  const handleDetailEdit = () => {
    if (detailTarget) {
      router.push(`/master-data/item-master/${detailTarget}/edit?tab=item-category`);
      setDetailTarget(null);
    }
  };

  const handleDeleteClick = (item: ItemCategoryListItem) => {
    setDeleteTarget(item);
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    deleteItemCategory(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
    });
  };

  const handleSearchChange = useCallback(
    (value: string | undefined) => {
      options?.onSetQueryParams?.({ search: value, page: 1 });
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

  const handleItemTypeChange = useCallback(
    (value: string | string[] | null | undefined) => {
      const stringValue = Array.isArray(value) ? value[0] : value;
      if (stringValue === 'all' || !stringValue) {
        options?.onUpdateQueryParam?.('itemTypeId', undefined);
      } else {
        options?.onUpdateQueryParam?.('itemTypeId', stringValue);
      }
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
    itemCategories,
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
    handleItemTypeChange,
    handleSort,
    handlePaginationChange,
  };
}
