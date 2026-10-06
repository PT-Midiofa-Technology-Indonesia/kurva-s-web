'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { getFieldErrors } from '@/lib/api-error';

import type { UpdateWarehousePayload } from '../api/update-warehouse';
import { useUpdateWarehouse } from './use-update-warehouse';
import { useWarehouse } from './use-warehouse';
import { WAREHOUSE_QUERY_KEYS } from './use-warehouses';

export function useEditWarehousePage(warehouseId: string) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: warehouse, isLoading } = useWarehouse(warehouseId);
  const { mutate: updateWarehouse, isPending } = useUpdateWarehouse(warehouseId);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<UpdateWarehousePayload | null>(null);
  const [serverErrors, setServerErrors] = useState<Record<string, string[]>>({});

  const handleCancel = () => router.push('/organization/warehouse');

  const handleBeforeSubmit = (payload: UpdateWarehousePayload) => {
    setPendingPayload(payload);
    setServerErrors({});
    setIsDialogOpen(true);
  };

  const handleConfirmSubmit = () => {
    if (!pendingPayload) return;
    updateWarehouse(pendingPayload, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: WAREHOUSE_QUERY_KEYS.all });
        queryClient.invalidateQueries({ queryKey: WAREHOUSE_QUERY_KEYS.detail(warehouseId) });
        setIsDialogOpen(false);
        setPendingPayload(null);
        router.push('/organization/warehouse');
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
    warehouse,
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
