'use client';

import { ConfirmDialog } from '@/shared/components/molecules/AlertDialog';
import { PROJECT_LIST_PAGE_LABELS } from '../constants';

interface SiteInstructionConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function SiteInstructionConfirmModal({
  open,
  onOpenChange,
  onConfirm,
  isLoading,
}: SiteInstructionConfirmModalProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      variant="danger"
      title={PROJECT_LIST_PAGE_LABELS.SITE_INSTRUCTION?.TITLE ?? 'Konfirmasi Site Instruction'}
      description={
        PROJECT_LIST_PAGE_LABELS.SITE_INSTRUCTION?.DESCRIPTION ??
        'Apakah anda yakin ingin membuat site instruction untuk project ini?'
      }
      cancelText={PROJECT_LIST_PAGE_LABELS.SITE_INSTRUCTION?.CANCEL ?? 'Batal'}
      confirmText={
        PROJECT_LIST_PAGE_LABELS.SITE_INSTRUCTION?.CONFIRM ?? 'Ya, Buat Site Instruction'
      }
      onConfirm={onConfirm}
      isLoading={isLoading}
    />
  );
}
