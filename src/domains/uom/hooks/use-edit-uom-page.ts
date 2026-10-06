'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { getFieldErrors } from '@/lib/api-error';
import type { UpdateUomPayload } from '../api/update-uom';
import { useUpdateUom } from './use-update-uom';

export function useEditUomPage(id: string) {
  const router = useRouter();
  const { mutate: updateUom, isPending } = useUpdateUom();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<UpdateUomPayload | null>(null);
  const [serverErrors, setServerErrors] = useState<Record<string, string[]>>({});

  const handleCancel = () => router.push('/master-data/uom');

  const handleBeforeSubmit = (payload: UpdateUomPayload) => {
    setPendingPayload(payload);
    setServerErrors({});
    setIsDialogOpen(true);
  };

  const handleConfirmSubmit = () => {
    if (!pendingPayload) return;
    updateUom(
      { id, payload: pendingPayload },
      {
        onSuccess: () => {
          setIsDialogOpen(false);
          setPendingPayload(null);
          router.push('/master-data/uom');
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
