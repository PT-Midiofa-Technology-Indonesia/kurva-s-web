'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { getFieldErrors } from '@/shared/lib/api-error';
import type { CreateAssetCategoryPayload } from '../api/create-asset-category';
import { ASSET_MANAGEMENT_ROUTES } from '../constants';
import { useCreateAssetCategory } from './use-create-asset-category';

export function useCreateAssetCategoryPage() {
  const router = useRouter();
  const returnUrl = ASSET_MANAGEMENT_ROUTES.ASSET_CATEGORY;
  const { mutate: createAssetCategory, isPending } = useCreateAssetCategory();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<CreateAssetCategoryPayload | null>(null);
  const [serverErrors, setServerErrors] = useState<Record<string, string[]>>({});

  const handleCancel = () => router.push(returnUrl);

  const handleBeforeSubmit = (payload: CreateAssetCategoryPayload) => {
    setServerErrors({});
    setPendingPayload(payload);
    setIsDialogOpen(true);
  };

  const handleConfirmSubmit = () => {
    if (!pendingPayload) return;
    createAssetCategory(pendingPayload, {
      onSuccess: () => {
        setIsDialogOpen(false);
        setPendingPayload(null);
        router.push(returnUrl);
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
