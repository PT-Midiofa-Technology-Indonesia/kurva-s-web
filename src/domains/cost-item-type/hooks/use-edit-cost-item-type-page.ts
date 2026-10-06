'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { getFieldErrors } from '@/lib/api-error';

import type { UpdateCostItemTypePayload } from '../api/update-cost-item-type';
import { useCostItemType } from './use-cost-item-type';
import { COST_ITEM_TYPE_QUERY_KEYS } from './use-cost-item-types';
import { useUpdateCostItemType } from './use-update-cost-item-type';

export function useEditCostItemTypePage(costItemTypeId: string) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: costItemType, isLoading } = useCostItemType(costItemTypeId);
  const { mutate: updateCostItemType, isPending } = useUpdateCostItemType(costItemTypeId);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<UpdateCostItemTypePayload | null>(null);
  const [serverErrors, setServerErrors] = useState<Record<string, string[]>>({});

  const handleCancel = () => router.push('/master-data/cost-item-type');

  const handleBeforeSubmit = (payload: UpdateCostItemTypePayload) => {
    setPendingPayload(payload);
    setServerErrors({});
    setIsDialogOpen(true);
  };

  const handleConfirmSubmit = () => {
    if (!pendingPayload) return;
    updateCostItemType(pendingPayload, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: COST_ITEM_TYPE_QUERY_KEYS.all });
        queryClient.invalidateQueries({
          queryKey: COST_ITEM_TYPE_QUERY_KEYS.detail(costItemTypeId),
        });
        setIsDialogOpen(false);
        setPendingPayload(null);
        router.push('/master-data/cost-item-type');
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
    costItemType,
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
