'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import type { GetGroupsParams } from '../api/get-groups';
import type { GroupListItem } from '../types';
import { useGroups } from './use-groups';

export interface UseGroupPageOptions {
  params?: GetGroupsParams;
  onUpdateQueryParam?: (key: string, value: string | undefined) => void;
  onSetQueryParams?: (params: Record<string, string | number | undefined>) => void;
}

export function useGroupPage(options?: UseGroupPageOptions) {
  const router = useRouter();
  const { data: groupsData, isLoading, isError, refetch } = useGroups(options?.params);
  const [detailTarget, setDetailTarget] = useState<string | null>(null);

  const groups = groupsData?.data || [];
  const totalItems = groupsData?.meta?.total;
  const totalPages = groupsData?.meta?.lastPage;

  const handleEdit = (group: GroupListItem) => {
    router.push(`/organization/group/${group.id}/edit`);
  };

  const handleDetail = (group: GroupListItem) => {
    setDetailTarget(group.id);
  };

  const handleDetailClose = () => {
    setDetailTarget(null);
  };

  const handleDetailEdit = () => {
    if (detailTarget) {
      setDetailTarget(null);
      router.push(`/organization/group/${detailTarget}/edit`);
    }
  };

  const handleDetailSuccess = () => {
    refetch();
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
    groups,
    totalItems,
    totalPages,
    isLoading,
    isError,
    handleEdit,
    handleDetail,
    detailTarget,
    handleDetailClose,
    handleDetailEdit,
    handleDetailSuccess,
    handleIsActiveChange,
    handleSearchChange,
    handleSort,
    handlePaginationChange,
  };
}
