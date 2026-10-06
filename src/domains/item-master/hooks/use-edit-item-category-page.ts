'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { getFieldErrors } from '@/lib/api-error';
import { getItemCategory } from '../api/get-item-category';
import type { UpdateItemCategoryPayload } from '../api/update-item-category';
import { ITEM_CATEGORY_QUERY_KEYS } from './use-item-categories';
import { useUpdateItemCategory } from './use-update-item-category';

export function useEditItemCategoryPage(id: string) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: itemCategoryResponse, isLoading: isLoadingItemCategory } = useQuery({
    queryKey: ITEM_CATEGORY_QUERY_KEYS.detail(id),
    queryFn: () => getItemCategory(id),
  });

  const itemCategory = itemCategoryResponse?.data || null;
  const { mutate: updateItemCategory, isPending } = useUpdateItemCategory(id);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<UpdateItemCategoryPayload | null>(null);
  const [serverErrors, setServerErrors] = useState<Record<string, string[]>>({});

  const handleCancel = () => {
    const tab = searchParams.get('tab');
    const returnUrl = tab ? `/master-data/item-master?tab=${tab}` : '/master-data/item-master';
    router.push(returnUrl);
  };

  const handleBeforeSubmit = (payload: UpdateItemCategoryPayload) => {
    setServerErrors({});
    setPendingPayload(payload);
    setIsDialogOpen(true);
  };

  const handleConfirmSubmit = () => {
    if (!pendingPayload) return;
    updateItemCategory(pendingPayload, {
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
    itemCategory,
    isLoadingItemCategory,
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
