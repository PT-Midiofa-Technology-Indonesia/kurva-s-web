'use client';

import { ConfirmDialog } from '@/shared/components/molecules/AlertDialog';
import { COST_REQUEST_LABELS } from '../constants';

interface CancelCostRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

/**
 * Fixed Indonesian copy baked in once so the list-row and detail-page
 * call sites can't drift from each other or from the AC's exact wording.
 */
export function CancelCostRequestDialog({
  open,
  onOpenChange,
  onConfirm,
  isLoading,
}: CancelCostRequestDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      variant="danger"
      title={COST_REQUEST_LABELS.CANCEL_DIALOG.TITLE}
      description={COST_REQUEST_LABELS.CANCEL_DIALOG.DESCRIPTION}
      cancelText={COST_REQUEST_LABELS.CANCEL_DIALOG.CANCEL_TEXT}
      confirmText={COST_REQUEST_LABELS.CANCEL_DIALOG.CONFIRM_TEXT}
      onCancel={() => onOpenChange(false)}
      onConfirm={onConfirm}
      isLoading={isLoading}
    />
  );
}
