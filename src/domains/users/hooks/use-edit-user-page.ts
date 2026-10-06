'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { getFieldErrors } from '@/lib/api-error';

import type { CreateUserPayload } from '../api/create-user';
import { useUpdateUser } from './use-update-user';
import { useUser } from './use-user';

export function useEditUserPage(userId: string) {
  const router = useRouter();
  const { data: user, isLoading } = useUser(userId);
  const { mutate: updateUser, isPending } = useUpdateUser(userId);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<CreateUserPayload | null>(null);
  const [serverErrors, setServerErrors] = useState<Record<string, string[]>>({});

  const handleCancel = () => router.push('/user-management/user');

  const handleBeforeSubmit = (payload: CreateUserPayload) => {
    setPendingPayload(payload);
    setServerErrors({});
    setIsDialogOpen(true);
  };

  const handleConfirmSubmit = () => {
    if (!pendingPayload) return;
    const payload = { ...pendingPayload };
    if (!payload.password) {
      delete payload.password;
    }
    updateUser(payload, {
      onSuccess: () => {
        setIsDialogOpen(false);
        setPendingPayload(null);
        setServerErrors({});
        router.push('/user-management/user');
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
    user,
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
