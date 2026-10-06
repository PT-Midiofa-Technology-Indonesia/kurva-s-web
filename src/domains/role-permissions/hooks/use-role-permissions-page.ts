'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';

import type { GetRolesParams } from '../api/get-roles';
import type { Role } from '../types';
import { useDeleteRole } from './use-delete-role';
import { useRoles } from './use-roles';

export interface UseRolePermissionsPageOptions {
  params?: GetRolesParams;
  onUpdateQueryParam?: (key: string, value: string | undefined) => void;
  onSetQueryParams?: (params: Record<string, string | number | undefined>) => void;
}

export function useRolePermissionsPage(options?: UseRolePermissionsPageOptions) {
  const router = useRouter();
  const { data: rolesData, isLoading, isError } = useRoles({ params: options?.params });
  const { mutate: deleteRole, isPending: isDeleting } = useDeleteRole();
  const [deleteTarget, setDeleteTarget] = useState<Role | null>(null);

  const roles = rolesData?.data || [];
  const totalItems = rolesData?.meta?.total;
  const totalPages = rolesData?.meta?.lastPage;

  const handleAdd = () => router.push('/user-management/role-permission/create');

  const handleDetail = (role: Role) =>
    router.push(`/user-management/role-permission/${role.id}/detail`);

  const handleEdit = (role: Role) =>
    router.push(`/user-management/role-permission/${role.id}/edit`);

  const handleDeleteClick = (role: Role) => setDeleteTarget(role);

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    deleteRole(String(deleteTarget.id), {
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
    roles,
    totalItems,
    totalPages,
    isLoading,
    isError,
    handleAdd,
    handleDetail,
    handleEdit,
    deleteTarget,
    setDeleteTarget,
    handleDeleteClick,
    handleDeleteConfirm,
    isDeleting,
    handleIsActiveChange,
    handleSearchChange,
    handleSort,
    handlePaginationChange,
  };
}
