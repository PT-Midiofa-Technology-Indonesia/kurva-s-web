'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { useDeleteUser } from './use-delete-user';
import { useUpdateUserStatus } from './use-update-user-status';
import { useUser } from './use-user';

export function useDetailUserPage(userId: string) {
  const router = useRouter();
  const { data: user, isLoading } = useUser(userId);
  const { mutate: deleteUser, isPending: isDeleting } = useDeleteUser();
  const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateUserStatus();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<boolean>(false);
  const [localActive, setLocalActive] = useState(user?.isActive ?? false);

  // Sync local status when user data changes (e.g. after refetch)
  useEffect(() => {
    if (user) {
      setLocalActive(user.isActive);
    }
  }, [user]);

  const handleBack = () => router.push('/user-management/user');

  const handleEdit = () => router.push(`/user-management/user/${userId}/edit`);

  const handleDeleteConfirm = () => {
    deleteUser(userId, {
      onSuccess: () => {
        setIsDeleteDialogOpen(false);
        router.push('/user-management/user');
      },
    });
  };

  const handleStatusToggle = (checked: boolean) => {
    // Optimistically update the UI
    setLocalActive(checked);
    setPendingStatus(checked);
    setIsStatusDialogOpen(true);
  };

  const handleStatusCancel = () => {
    // Roll back UI state if canceled
    setLocalActive(user?.isActive ?? false);
    setIsStatusDialogOpen(false);
  };

  const handleStatusConfirm = () => {
    updateStatus(
      { userId, payload: { isActive: pendingStatus } },
      {
        onSuccess: () => {
          setIsStatusDialogOpen(false);
        },
        onError: () => {
          // Roll back UI state on error
          setLocalActive(user?.isActive ?? false);
          setIsStatusDialogOpen(false);
        },
      }
    );
  };

  return {
    user,
    isLoading,
    isDeleting,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isStatusDialogOpen,
    setIsStatusDialogOpen,
    isUpdatingStatus,
    localActive,
    handleBack,
    handleEdit,
    handleDeleteConfirm,
    handleStatusToggle,
    handleStatusConfirm,
    handleStatusCancel,
  };
}
