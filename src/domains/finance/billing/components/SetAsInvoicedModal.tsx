'use client';

import { Send } from 'lucide-react';
import { Button } from '@/shared/components/ui';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { toast } from '@/shared/lib/toast';
import { BILLING_MODAL_LABELS } from '../constants';
import { useSetBillingAsInvoiced } from '../hooks/use-set-billing-as-invoiced';
import type { Billing } from '../types';

interface SetAsInvoicedModalProps {
  open: boolean;
  billing: Billing | null;
  companyId: string;
  onClose: () => void;
}

export function SetAsInvoicedModal({ open, billing, companyId, onClose }: SetAsInvoicedModalProps) {
  const { mutate: setAsInvoiced, isPending } = useSetBillingAsInvoiced();

  const handleConfirm = () => {
    if (!billing) return;
    setAsInvoiced(
      { billingId: billing.id, companyId },
      {
        onSuccess: () => {
          toast.success({ title: 'Billing berhasil ditandai sebagai invoiced' });
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
      <DialogContent className="max-w-[440px] rounded-2xl p-8" showCloseButton={false}>
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 ring-8 ring-blue-50/70">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <Send className="h-5 w-5" />
            </div>
          </div>

          <div className="space-y-2">
            <DialogTitle className="text-2xl font-semibold text-slate-950">
              {BILLING_MODAL_LABELS.SET_AS_INVOICED_PUBLISH_TITLE}
            </DialogTitle>
            <DialogDescription className="text-sm leading-6 text-slate-500">
              {BILLING_MODAL_LABELS.SET_AS_INVOICED_PUBLISH_DESCRIPTION}
            </DialogDescription>
            <p className="text-base font-semibold text-slate-950">{billing?.code ?? '-'}</p>
          </div>
        </div>

        <DialogFooter className="mx-0 mb-0 mt-6 flex-row rounded-none border-t-0 bg-transparent p-0 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            className="h-11 flex-1 rounded-xl border-slate-200"
            onClick={onClose}
            disabled={isPending}
          >
            {BILLING_MODAL_LABELS.BUTTONS.CANCEL}
          </Button>
          <Button
            type="button"
            className="h-11 flex-1 rounded-xl bg-blue-600 hover:bg-blue-700"
            onClick={handleConfirm}
            disabled={isPending}
          >
            {isPending
              ? BILLING_MODAL_LABELS.BUTTONS.PROCESSING
              : BILLING_MODAL_LABELS.BUTTONS.SET_AS_INVOICED}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
