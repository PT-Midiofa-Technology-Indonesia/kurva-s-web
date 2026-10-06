'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { getFieldErrors } from '@/lib/api-error';

import type { CreateProjectTypePayload } from '../api/create-project-type';
import { useCreateProjectType } from './use-create-project-type';

export function useCreateProjectTypePage() {
  const router = useRouter();
  const { mutate: createProjectType, isPending } = useCreateProjectType();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<CreateProjectTypePayload | null>(null);
  const [serverErrors, setServerErrors] = useState<Record<string, string[]>>({});

  const handleCancel = () => router.push('/master-data/project-type');

  const handleBeforeSubmit = (payload: CreateProjectTypePayload) => {
    setServerErrors({});
    setPendingPayload(payload);
    setIsDialogOpen(true);
  };

  const handleConfirmSubmit = () => {
    if (!pendingPayload) return;
    createProjectType(pendingPayload, {
      onSuccess: () => {
        setIsDialogOpen(false);
        setPendingPayload(null);
        router.push('/master-data/project-type');
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
