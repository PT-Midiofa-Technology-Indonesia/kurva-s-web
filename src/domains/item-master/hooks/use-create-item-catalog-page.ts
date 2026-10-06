'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { getFieldErrors } from '@/lib/api-error';
import type { CreateItemCatalogPayload } from '../api/create-item-catalog';
import { useCreateItemCatalog } from './use-create-item-catalog';

export function useCreateItemCatalogPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { mutate: createItemCatalog, isPending } = useCreateItemCatalog();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<CreateItemCatalogPayload | null>(null);
  const [serverErrors, setServerErrors] = useState<Record<string, string[]>>({});

  const handleCancel = () => {
    const tab = searchParams.get('tab');
    const returnUrl = tab ? `/master-data/item-master?tab=${tab}` : '/master-data/item-master';
    router.push(returnUrl);
  };

  const handleBeforeSubmit = (payload: CreateItemCatalogPayload) => {
    setServerErrors({});
    setPendingPayload(payload);
    setIsDialogOpen(true);
  };

  const handleConfirmSubmit = () => {
    if (!pendingPayload) return;
    createItemCatalog(pendingPayload, {
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
