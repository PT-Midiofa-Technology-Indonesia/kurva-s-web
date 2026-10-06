'use client';

import { useState } from 'react';
import { toast } from '@/shared/lib/toast';
import { COST_REQUEST_LABELS } from '../constants';
import { useCancelCostRequest } from './use-cancel-cost-request';
import { useCostRequest } from './use-cost-request';

/**
 * Fetch + cancel orchestration for the detail page. Editing no longer has
 * its own inline form state here — it reuses `CostRequestFormModal` (the
 * same dialog as Create), toggled via `isEditModalOpen`.
 */
export function useCostRequestDetailPage(id: string, companyId?: string) {
  const { data: costRequest, isLoading, isError } = useCostRequest(id, companyId);
  const { mutate: cancelItem, isPending: isCancelling } = useCancelCostRequest();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

  const canEdit = costRequest?.status === 'submitted';
  const canCancel = costRequest?.status === 'submitted';

  const handleCancelClick = () => setIsCancelDialogOpen(true);

  const handleCancelConfirm = () => {
    cancelItem(
      { id, companyId },
      {
        onSuccess: (result) => {
          toast.error({ title: COST_REQUEST_LABELS.TOAST.cancelSuccess(result.code) });
          setIsCancelDialogOpen(false);
        },
      }
    );
  };

  return {
    costRequest,
    isLoading,
    isError,
    canEdit,
    canCancel,
    isEditModalOpen,
    setIsEditModalOpen,
    isCancelDialogOpen,
    setIsCancelDialogOpen,
    handleCancelClick,
    handleCancelConfirm,
    isCancelling,
  };
}
