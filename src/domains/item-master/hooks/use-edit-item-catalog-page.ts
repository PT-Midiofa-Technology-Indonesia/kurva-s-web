'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { getFieldErrors } from '@/lib/api-error';
import type { UpdateItemCatalogPayload } from '../api/update-item-catalog';
import { useItemCatalog } from './use-item-catalog';
import { useUpdateItemCatalog } from './use-update-item-catalog';

export function useEditItemCatalogPage(id: string) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: itemCatalogResponse, isLoading: isLoadingItemCatalog } = useItemCatalog(id);

  const itemCatalog = itemCatalogResponse?.data || null;
  const { mutate: updateItemCatalog, isPending } = useUpdateItemCatalog(id);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<UpdateItemCatalogPayload | null>(null);
  const [serverErrors, setServerErrors] = useState<Record<string, string[]>>({});

  const handleCancel = () => {
    const tab = searchParams.get('tab');
    const returnUrl = tab ? `/master-data/item-master?tab=${tab}` : '/master-data/item-master';
    router.push(returnUrl);
  };

  const handleBeforeSubmit = (payload: UpdateItemCatalogPayload) => {
    setServerErrors({});
    setPendingPayload(payload);
    setIsDialogOpen(true);
  };

  const handleConfirmSubmit = () => {
    if (!pendingPayload) return;
    updateItemCatalog(pendingPayload, {
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
    itemCatalog,
    isLoadingItemCatalog,
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
