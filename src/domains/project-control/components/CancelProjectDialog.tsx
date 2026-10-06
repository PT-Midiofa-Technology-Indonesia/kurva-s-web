'use client';

import { ConfirmDialog } from '@/shared/components/molecules/AlertDialog';

interface CancelProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function CancelProjectDialog({
  open,
  onOpenChange,
  onConfirm,
  isLoading,
}: CancelProjectDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      variant="danger"
      title="Konfirmasi Batalkan Project"
      description="Apakah anda yakin ingin membatalkan project ini?"
      cancelText="Batal"
      confirmText="Ya, Batalkan"
      onConfirm={onConfirm}
      isLoading={isLoading}
    />
  );
}
