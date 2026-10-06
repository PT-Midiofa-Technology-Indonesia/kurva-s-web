'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { useDeleteRole } from './use-delete-role';
import { useRoleWithPermissions } from './use-role-with-permissions';

export function useDetailRolePage(roleId: string) {
  const router = useRouter();
  const { data: role, isLoading } = useRoleWithPermissions(roleId);
  const { mutate: deleteRole, isPending: isDeleting } = useDeleteRole();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleBack = () => router.push('/user-management/role-permission');

  const handleEdit = () => router.push(`/user-management/role-permission/${roleId}/edit`);

  const handleDeleteConfirm = () => {
    deleteRole(roleId, {
      onSuccess: () => {
        setIsDeleteDialogOpen(false);
        router.push('/user-management/role-permission');
      },
    });
  };

  return {
    role,
    isLoading,
    isDeleting,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    handleBack,
    handleEdit,
    handleDeleteConfirm,
  };
}
