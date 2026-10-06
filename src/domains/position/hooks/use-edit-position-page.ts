'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { getFieldErrors } from '@/lib/api-error';
import type { UpdatePositionPayload } from '../api/update-position';
import { usePosition } from './use-position';
import { POSITION_QUERY_KEYS } from './use-positions';
import { useUpdatePosition } from './use-update-position';

export function useEditPositionPage(positionId: string) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: position, isLoading } = usePosition(positionId);
  const { mutate: updatePosition, isPending } = useUpdatePosition(positionId);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<UpdatePositionPayload | null>(null);
  const [serverErrors, setServerErrors] = useState<Record<string, string[]>>({});

  const handleCancel = () => router.push('/master-data/position');

  const handleBeforeSubmit = (payload: UpdatePositionPayload) => {
    setPendingPayload(payload);
    setServerErrors({});
    setIsDialogOpen(true);
  };

  const handleConfirmSubmit = () => {
    if (!pendingPayload) return;
    updatePosition(pendingPayload, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: POSITION_QUERY_KEYS.all });
        queryClient.invalidateQueries({ queryKey: POSITION_QUERY_KEYS.detail(positionId) });
        queryClient.invalidateQueries({ queryKey: POSITION_QUERY_KEYS.infinite() });
        setIsDialogOpen(false);
        setPendingPayload(null);
        router.push('/master-data/position');
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
    position,
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
