'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { getFieldErrors } from '@/lib/api-error';
import type { CreateItemCategoryPayload } from '../api/create-item-category';
import { useCreateItemCategory } from './use-create-item-category';

export function useCreateItemCategoryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { mutate: createItemCategory, isPending } = useCreateItemCategory();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<CreateItemCategoryPayload | null>(null);
  const [serverErrors, setServerErrors] = useState<Record<string, string[]>>({});

  const handleCancel = () => {
    const tab = searchParams.get('tab');
    const returnUrl = tab ? `/master-data/item-master?tab=${tab}` : '/master-data/item-master';
    router.push(returnUrl);
  };

  const handleBeforeSubmit = (payload: CreateItemCategoryPayload) => {
    setServerErrors({});
    setPendingPayload(payload);
    setIsDialogOpen(true);
  };

  const handleConfirmSubmit = () => {
    if (!pendingPayload) return;
    createItemCategory(pendingPayload, {
      onSuccess: () => {
        setIsDialogOpen(false);
        setPendingPayload(null);
        const tab = searchParams.get('tab');
        const returnUrl = tab ? `/master-data/item-master?tab=${tab}` : '/master-data/item-master';
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
