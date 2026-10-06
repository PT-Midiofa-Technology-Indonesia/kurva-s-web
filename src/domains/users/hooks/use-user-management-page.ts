'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';

import { useDebounce } from '@/shared/hooks/use-debounce';
import type { GetUsersParams } from '../api/get-users';
import type { UserListItem } from '../types';
import { useDeleteUser } from './use-delete-user';
import { useRolesInfinite } from './use-roles-infinite';
import { useUsers } from './use-users';

export interface UseUserManagementPageOptions {
  params?: GetUsersParams;
  onUpdateQueryParam?: (key: string, value: string | undefined) => void;
  onSetQueryParams?: (params: Record<string, string | number | undefined>) => void;
}

export function useUserManagementPage(options?: UseUserManagementPageOptions) {
  const router = useRouter();
  const { data: usersData, isLoading, isError } = useUsers({ params: options?.params });
  const { mutate: deleteUser, isPending: isDeleting } = useDeleteUser();
  const [deleteTarget, setDeleteTarget] = useState<UserListItem | null>(null);

  const [roleSearch, setRoleSearch] = useState('');
  const debouncedRoleSearch = useDebounce(roleSearch, 300);
  const {
    options: roleOptions,
    isLoading: isLoadingRoles,
    hasMore: hasMoreRoles,
    isFetchingNextPage: isFetchingMoreRoles,
    loadMore: loadMoreRoles,
  } = useRolesInfinite({ search: debouncedRoleSearch });

  const handleRoleSearchChange = useCallback((value: string) => {
    setRoleSearch(value);
  }, []);

  const handleLoadMoreRoles = useCallback(() => {
    if (hasMoreRoles && !isFetchingMoreRoles) {
      loadMoreRoles();
    }
  }, [hasMoreRoles, isFetchingMoreRoles, loadMoreRoles]);

  const users = usersData?.data || [];
  const totalItems = usersData?.meta?.total;
  const totalPages = usersData?.meta?.lastPage;

  const handleAdd = () => router.push('/user-management/user/create');
  const handleEdit = (user: UserListItem) => router.push(`/user-management/user/${user.id}/edit`);
  const handleDetail = (user: UserListItem) =>
    router.push(`/user-management/user/${user.id}/detail`);

  const handleDeleteClick = (user: UserListItem) => setDeleteTarget(user);

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    deleteUser(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
    });
  };

  const handleStatusChange = useCallback(
    (value: string | string[] | null | undefined) => {
      const stringValue = Array.isArray(value) ? value[0] : value;
      if (stringValue === 'all' || !stringValue) {
        options?.onUpdateQueryParam?.('status', undefined);
      } else {
        options?.onUpdateQueryParam?.('status', stringValue);
      }
    },
    [options]
  );

  const handleRoleChange = useCallback(
    (value: string | string[] | null | undefined) => {
      const stringValue = Array.isArray(value) ? value[0] : value;
      if (stringValue === 'all' || !stringValue) {
        options?.onUpdateQueryParam?.('roleId', undefined);
      } else {
        options?.onUpdateQueryParam?.('roleId', stringValue);
      }
    },
    [options]
  );

  const handleUserTypeChange = useCallback(
    (value: string | string[] | null | undefined) => {
      const stringValue = Array.isArray(value) ? value[0] : value;
      if (stringValue === 'all' || !stringValue) {
        options?.onUpdateQueryParam?.('userType', undefined);
      } else {
        options?.onUpdateQueryParam?.('userType', stringValue);
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
    users,
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
    isDeleting,
    handleStatusChange,
    handleRoleChange,
    handleUserTypeChange,
    handleSearchChange,
    handleSort,
    handlePaginationChange,
    roleOptions,
    isLoadingRoles,
    handleLoadMoreRoles,
    handleRoleSearchChange,
  };
}
