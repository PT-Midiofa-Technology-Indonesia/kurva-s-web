'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { getFieldErrors } from '@/lib/api-error';

import type { CreateRolePayload } from '../api/create-role';
import { useRoleWithPermissions } from './use-role-with-permissions';
import { useUpdateRole } from './use-update-role';

export function useEditRolePage(roleId: string) {
  const router = useRouter();
  const { data: role, isLoading } = useRoleWithPermissions(roleId);
  const { mutate: updateRole, isPending } = useUpdateRole(roleId);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<CreateRolePayload | null>(null);
  const [serverErrors, setServerErrors] = useState<Record<string, string[]>>({});

  const handleCancel = () => router.push('/user-management/role-permission');

  const handleBeforeSubmit = (payload: CreateRolePayload) => {
    setPendingPayload(payload);
    setServerErrors({});
    setIsDialogOpen(true);
  };

  const handleConfirmSubmit = () => {
    if (!pendingPayload) return;
    updateRole(pendingPayload, {
      onSuccess: () => {
        setIsDialogOpen(false);
        setPendingPayload(null);
        setServerErrors({});
        router.push('/user-management/role-permission');
      },
      onError: (error) => {
        const fieldErrors = getFieldErrors(error);
        if (fieldErrors) {
          setServerErrors(fieldErrors);
        }
      },
    });
  };

  const handleDialogCancel = () => {
    setIsDialogOpen(false);
    setPendingPayload(null);
  };

  return {
    role,
    isLoading,
    isDialogOpen,
    setIsDialogOpen,
    isPending,
    serverErrors,
    handleCancel,
    handleBeforeSubmit,
    handleConfirmSubmit,
    handleDialogCancel,
  };
}
