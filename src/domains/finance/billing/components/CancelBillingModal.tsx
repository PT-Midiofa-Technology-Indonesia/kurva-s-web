'use client';

import { CircleAlert } from 'lucide-react';
import { Button } from '@/shared/components/ui';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { toast } from '@/shared/lib/toast';
import { useCancelBilling } from '../hooks/use-cancel-billing';
import type { Billing } from '../types';

interface CancelBillingModalProps {
  open: boolean;
  billing: Billing | null;
  companyId: string;
  onClose: () => void;
}

export function CancelBillingModal({ open, billing, companyId, onClose }: CancelBillingModalProps) {
  const { mutate: cancelBilling, isPending } = useCancelBilling();

  const handleConfirm = () => {
    if (!billing) return;
    cancelBilling(
      { billingId: billing.id, companyId },
      {
        onSuccess: () => {
          toast.success({ title: 'Billing berhasil dibatalkan' });
          onClose();
        },
        onError: () => {
          toast.error({ title: 'Gagal membatalkan billing' });
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
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 ring-8 ring-red-50/70">
            <CircleAlert className="h-7 w-7 text-red-500" />
          </div>

          <div className="space-y-2">
            <DialogTitle className="text-2xl font-semibold text-slate-950">
              Batalkan Tagihan
            </DialogTitle>
            <DialogDescription className="text-sm leading-6 text-slate-500">
              Apakah anda yakin ingin membatalkan tagihan ini
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
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="h-11 flex-1 rounded-xl"
            onClick={handleConfirm}
            disabled={isPending}
          >
            {isPending ? 'Membatalkan...' : 'Batalkan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
