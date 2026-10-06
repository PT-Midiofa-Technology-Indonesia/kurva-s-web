'use client';

import { useSearchParams } from 'next/navigation';
import { useRef, useState } from 'react';
import { groupPayrollDraftItems } from '../services/group-payroll-draft-items';
import { useCancelPayrollDraft } from './use-cancel-payroll-draft';
import { useGeneratePayrollDraft } from './use-generate-payroll-draft';
import { usePayrollDraft } from './use-payroll-draft';
import { usePayrollDraftPreview } from './use-payroll-draft-preview';

export type PayrollDraftConfirmationTarget = 'generate' | 'cancel' | null;

export function usePayrollDraftDetailPage(draftId: string) {
  const searchParams = useSearchParams();
  const companyId = searchParams.get('companyId') ?? undefined;
  const [confirmationTarget, setConfirmationTarget] =
    useState<PayrollDraftConfirmationTarget>(null);
  const confirmationLockedRef = useRef(false);
  const detailQuery = usePayrollDraft(draftId, companyId);
  const detail = detailQuery.data;
  const isDraft = detail?.status === 'draft';
  const isGenerated = detail?.status === 'generated';
  const isCancelled = detail?.status === 'cancelled';
  const previewQuery = usePayrollDraftPreview(draftId, companyId, isDraft);
  const generateMutation = useGeneratePayrollDraft();
  const cancelMutation = useCancelPayrollDraft();
  const groupedItems = groupPayrollDraftItems(detail?.items ?? []);

  const requestGenerate = () => {
    if (isDraft) setConfirmationTarget('generate');
  };

  const requestCancel = () => {
    if (isDraft || isGenerated) setConfirmationTarget('cancel');
  };

  const closeConfirmation = () => setConfirmationTarget(null);
  const canDismissConfirmation = () => !confirmationLockedRef.current;

  const confirmAction = () => {
    if (!companyId) return;

    const variables = { id: draftId, companyId };
    if (confirmationTarget === 'generate' && isDraft) {
      confirmationLockedRef.current = true;
      generateMutation.mutate(variables, {
        onSuccess: closeConfirmation,
        onSettled: () => {
          confirmationLockedRef.current = false;
        },
      });
    }
    if (confirmationTarget === 'cancel' && (isDraft || isGenerated)) {
      confirmationLockedRef.current = true;
      cancelMutation.mutate(variables, {
        onSuccess: closeConfirmation,
        onSettled: () => {
          confirmationLockedRef.current = false;
        },
      });
    }
  };

  return {
    companyId,
    detail,
    preview: previewQuery.data,
    groupedItems,
    isDraft,
    isGenerated,
    isCancelled,
    confirmationTarget,
    isLoading: detailQuery.isLoading,
    isError: detailQuery.isError,
    error: detailQuery.error,
    isPreviewLoading: previewQuery.isLoading,
    isPreviewError: previewQuery.isError,
    previewError: previewQuery.error,
    refetchDetail: detailQuery.refetch,
    refetchPreview: previewQuery.refetch,
    isGenerating: generateMutation.isPending,
    isCancelling: cancelMutation.isPending,
    requestGenerate,
    requestCancel,
    closeConfirmation,
    canDismissConfirmation,
    confirmAction,
  };
}
