'use client';

import { Check } from 'lucide-react';
import { Button } from '@/shared/components/ui';
import { Dialog, DialogContent, DialogFooter } from '@/shared/components/ui/dialog';
import { toast } from '@/shared/lib/toast';
import { BILLING_MODAL_LABELS } from '../constants';
import { useMarkBillingCleared } from '../hooks/use-mark-billing-cleared';
import type { Billing } from '../types';

interface MarkClearedModalProps {
  open: boolean;
  billing: Billing | null;
  companyId: string;
  onClose: () => void;
}

export function MarkClearedModal({ open, billing, companyId, onClose }: MarkClearedModalProps) {
  const { mutate: markCleared, isPending } = useMarkBillingCleared();

  const handleConfirm = () => {
    if (!billing) return;
    markCleared(
      { billingId: billing.id, companyId },
      {
        onSuccess: () => {
          toast.success({ title: 'Billing berhasil ditandai sebagai cleared' });
          onClose();
        },
        onError: () => {
          toast.error({ title: 'Gagal mengubah status billing' });
        },
      }
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <DialogContent className="max-w-[430px] rounded-[10px]" showCloseButton={false}>
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex size-9 items-center justify-center rounded-full border border-border">
            <Check className="size-4 text-green-600" />
          </div>
          <h2 className="text-[18px] font-semibold leading-7 text-slate-950">
            {BILLING_MODAL_LABELS.MARK_CLEARED_TITLE}
          </h2>
          <p className="text-[14px] leading-5 text-muted-foreground">
            {BILLING_MODAL_LABELS.MARK_CLEARED_DESCRIPTION.replace(
              'billing ini',
              `billing ${billing?.code ?? ''}`
            )}
          </p>
        </div>

        <DialogFooter className="mx-0 mb-0 mt-4 flex-row rounded-none border-t-0 bg-transparent p-0 pt-4 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            className="h-9 flex-1 rounded-lg"
            onClick={onClose}
            disabled={isPending}
          >
            {BILLING_MODAL_LABELS.BUTTONS.CANCEL}
          </Button>
          <Button
            type="button"
            className="h-9 flex-1 rounded-lg"
            onClick={handleConfirm}
            disabled={isPending}
          >
            {isPending ? BILLING_MODAL_LABELS.BUTTONS.SAVING : BILLING_MODAL_LABELS.BUTTONS.CONFIRM}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
