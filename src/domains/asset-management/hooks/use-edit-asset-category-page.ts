'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { getFieldErrors } from '@/shared/lib/api-error';
import type { UpdateAssetCategoryPayload } from '../api/update-asset-category';
import { ASSET_MANAGEMENT_ROUTES } from '../constants';
import { useAssetCategory } from './use-asset-category';
import { useUpdateAssetCategory } from './use-update-asset-category';

export function useEditAssetCategoryPage(assetCategoryId: string) {
  const router = useRouter();
  const returnUrl = ASSET_MANAGEMENT_ROUTES.ASSET_CATEGORY;
  const { data: assetCategoryResponse, isLoading: isLoadingAssetCategory } =
    useAssetCategory(assetCategoryId);
  const assetCategory = assetCategoryResponse?.data ?? null;
  const { mutate: updateAssetCategory, isPending } = useUpdateAssetCategory(assetCategoryId);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<UpdateAssetCategoryPayload | null>(null);
  const [serverErrors, setServerErrors] = useState<Record<string, string[]>>({});

  const handleCancel = () => router.push(returnUrl);

  const handleBeforeSubmit = (payload: UpdateAssetCategoryPayload) => {
    setServerErrors({});
    setPendingPayload(payload);
    setIsDialogOpen(true);
  };

  const handleConfirmSubmit = () => {
    if (!pendingPayload) return;
    updateAssetCategory(pendingPayload, {
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
    assetCategory,
    isLoadingAssetCategory,
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
