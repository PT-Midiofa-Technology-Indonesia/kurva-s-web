'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { getFieldErrors } from '@/lib/api-error';
import type { CreateVendorCatalogPayload } from '../api/create-vendor-catalog';
import { useCreateVendorCatalog } from './use-create-vendor-catalog';

export function useCreateVendorCatalogPage() {
  const router = useRouter();
  const { mutate: createVendorCatalog, isPending } = useCreateVendorCatalog();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<CreateVendorCatalogPayload | null>(null);
  const [serverErrors, setServerErrors] = useState<Record<string, string[]>>({});

  const handleCancel = () => router.push('/vendor-management/vendor-catalog');

  const handleBeforeSubmit = (payload: CreateVendorCatalogPayload) => {
    setPendingPayload(payload);
    setServerErrors({});
    setIsDialogOpen(true);
  };

  const handleConfirmSubmit = () => {
    if (!pendingPayload) return;
    createVendorCatalog(pendingPayload, {
      onSuccess: () => {
        setIsDialogOpen(false);
        setPendingPayload(null);
        router.push('/vendor-management/vendor-catalog');
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
