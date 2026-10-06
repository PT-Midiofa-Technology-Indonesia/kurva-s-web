'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { getFieldErrors } from '@/lib/api-error';

import type { UpdateOfficePayload } from '../api/update-office';
import { useOffice } from './use-office';
import { OFFICE_QUERY_KEYS } from './use-offices';
import { useUpdateOffice } from './use-update-office';

export function useEditOfficePage(officeId: string) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: office, isLoading } = useOffice(officeId);
  const { mutate: updateOffice, isPending } = useUpdateOffice(officeId);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<UpdateOfficePayload | null>(null);
  const [serverErrors, setServerErrors] = useState<Record<string, string[]>>({});

  const handleCancel = () => router.push('/organization/office');

  const handleBeforeSubmit = (payload: UpdateOfficePayload) => {
    setPendingPayload(payload);
    setServerErrors({});
    setIsDialogOpen(true);
  };

  const handleConfirmSubmit = () => {
    if (!pendingPayload) return;
    updateOffice(pendingPayload, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: OFFICE_QUERY_KEYS.lists() });
        queryClient.invalidateQueries({ queryKey: OFFICE_QUERY_KEYS.detail(officeId) });
        setIsDialogOpen(false);
        setPendingPayload(null);
        router.push('/organization/office');
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
    office,
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
