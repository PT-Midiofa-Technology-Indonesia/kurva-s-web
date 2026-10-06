'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { getFieldErrors } from '@/lib/api-error';
import type { UpdateVendorCatalogPayload } from '../api/update-vendor-catalog';
import { useUpdateVendorCatalog } from './use-update-vendor-catalog';

export function useEditVendorCatalogPage(id: string) {
  const router = useRouter();
  const { mutate: updateVendorCatalog, isPending } = useUpdateVendorCatalog();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<UpdateVendorCatalogPayload | null>(null);
  const [serverErrors, setServerErrors] = useState<Record<string, string[]>>({});

  const handleCancel = () => router.push('/vendor-management/vendor-catalog');

  const handleBeforeSubmit = (payload: UpdateVendorCatalogPayload) => {
    setPendingPayload(payload);
    setServerErrors({});
    setIsDialogOpen(true);
  };

  const handleConfirmSubmit = () => {
    if (!pendingPayload) return;
    updateVendorCatalog(
      { id, payload: pendingPayload },
      {
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
      }
    );
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
