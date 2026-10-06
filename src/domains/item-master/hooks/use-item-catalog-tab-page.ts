'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import type { GetItemCatalogsParams } from '../api/get-item-catalogs';
import type { ItemCatalogListItem } from '../types';
import { useDeleteItemCatalog } from './use-delete-item-catalog';
import { useItemCatalogs } from './use-item-catalogs';

export interface UseItemCatalogTabPageOptions {
  params?: GetItemCatalogsParams;
  onUpdateQueryParam?: (key: string, value: string | undefined) => void;
  onSetQueryParams?: (params: Record<string, string | number | undefined>) => void;
}

export function useItemCatalogTabPage(options?: UseItemCatalogTabPageOptions) {
  const router = useRouter();
  const { data: itemCatalogsData, isLoading, isError } = useItemCatalogs(options?.params);
  const { mutate: deleteItemCatalog, isPending: isDeleting } = useDeleteItemCatalog();

  const [deleteTarget, setDeleteTarget] = useState<ItemCatalogListItem | null>(null);
  const [detailTarget, setDetailTarget] = useState<string | null>(null);

  const itemCatalogs = itemCatalogsData?.data || [];
  const totalItems = itemCatalogsData?.meta?.total;
  const totalPages = itemCatalogsData?.meta?.lastPage;

  const handleAdd = () => {
    router.push('/master-data/item-master/create?tab=item-catalog');
  };

  const handleEdit = (item: ItemCatalogListItem) => {
    router.push(`/master-data/item-master/${item.id}/edit?tab=item-catalog`);
  };

  const handleDetail = (item: ItemCatalogListItem) => {
    setDetailTarget(item.id);
  };

  const handleDetailClose = () => {
    setDetailTarget(null);
  };

  const handleDetailEdit = () => {
    if (detailTarget) {
      router.push(`/master-data/item-master/${detailTarget}/edit?tab=item-catalog`);
      setDetailTarget(null);
    }
  };

  const handleDeleteClick = (item: ItemCatalogListItem) => {
    setDeleteTarget(item);
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    deleteItemCatalog(deleteTarget.id, {
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

  const handleItemCategoryChange = useCallback(
    (value: string | string[] | null | undefined) => {
      const stringValue = Array.isArray(value) ? value[0] : value;
      if (stringValue === 'all' || !stringValue) {
        options?.onUpdateQueryParam?.('itemCategoryId', undefined);
      } else {
        options?.onUpdateQueryParam?.('itemCategoryId', stringValue);
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
    itemCatalogs,
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
    handleItemCategoryChange,
    handleSort,
    handlePaginationChange,
  };
}
