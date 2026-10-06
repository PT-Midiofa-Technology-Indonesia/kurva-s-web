'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { getFieldErrors } from '@/lib/api-error';

import type { CreateCostItemTypePayload } from '../api/create-cost-item-type';
import { useCreateCostItemType } from './use-create-cost-item-type';

export function useCreateCostItemTypePage() {
  const router = useRouter();
  const { mutate: createCostItemType, isPending } = useCreateCostItemType();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<CreateCostItemTypePayload | null>(null);
  const [serverErrors, setServerErrors] = useState<Record<string, string[]>>({});

  const handleCancel = () => router.push('/master-data/cost-item-type');

  const handleBeforeSubmit = (payload: CreateCostItemTypePayload) => {
    setPendingPayload(payload);
    setServerErrors({});
    setIsDialogOpen(true);
  };

  const handleConfirmSubmit = () => {
    if (!pendingPayload) return;
    createCostItemType(pendingPayload, {
      onSuccess: () => {
        setIsDialogOpen(false);
        setPendingPayload(null);
        router.push('/master-data/cost-item-type');
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
