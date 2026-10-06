'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { getFieldErrors } from '@/lib/api-error';

import type { UpdatePaymentTypePayload } from '../api/update-payment-type';
import { usePaymentType } from './use-payment-type';
import { PAYMENT_TYPE_QUERY_KEYS } from './use-payment-types';
import { useUpdatePaymentType } from './use-update-payment-type';

export function useEditPaymentTypePage(paymentTypeId: string) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: paymentType, isLoading } = usePaymentType(paymentTypeId);
  const { mutate: updatePaymentType, isPending } = useUpdatePaymentType(paymentTypeId);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<UpdatePaymentTypePayload | null>(null);
  const [serverErrors, setServerErrors] = useState<Record<string, string[]>>({});

  const handleCancel = () => router.push('/master-data/payment-type');

  const handleBeforeSubmit = (payload: UpdatePaymentTypePayload) => {
    setPendingPayload(payload);
    setServerErrors({});
    setIsDialogOpen(true);
  };

  const handleConfirmSubmit = () => {
    if (!pendingPayload) return;
    updatePaymentType(pendingPayload, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: PAYMENT_TYPE_QUERY_KEYS.all });
        queryClient.invalidateQueries({ queryKey: PAYMENT_TYPE_QUERY_KEYS.detail(paymentTypeId) });
        setIsDialogOpen(false);
        setPendingPayload(null);
        router.push('/master-data/payment-type');
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
    paymentType,
    isLoading,
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
