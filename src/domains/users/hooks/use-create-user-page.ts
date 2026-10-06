'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { getFieldErrors } from '@/lib/api-error';

import type { CreateUserPayload } from '../api/create-user';
import { useCreateUser } from './use-create-user';

export function useCreateUserPage() {
  const router = useRouter();
  const { mutate: createUser, isPending } = useCreateUser();
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
    createUser(pendingPayload, {
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
