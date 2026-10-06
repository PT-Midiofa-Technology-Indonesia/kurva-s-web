'use client';

import { ConfirmDialog } from '@/shared/components/molecules/AlertDialog';

interface CancelConfirmDialogProps {
  open: boolean;
  paymentRequestCode: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function CancelConfirmDialog({
  open,
  paymentRequestCode,
  onConfirm,
  onCancel,
}: CancelConfirmDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={(v) => !v && onCancel()}
      variant="danger"
      title="Konfirmasi Pembatalan"
      description={`Apakah anda yakin ingin membatalkan payment request ${paymentRequestCode}?`}
      cancelText="Batal"
      confirmText="Ya, Batalkan"
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  );
}
