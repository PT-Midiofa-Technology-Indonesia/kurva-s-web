'use client';

import { useCallback, useState } from 'react';
import { Button } from '@/shared/components/atoms';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import type { PaymentMethod } from '../types/po-finalize';
import { makeMethod, PaymentMethodForm } from './PaymentMethodForm';

interface PaymentMethodModalProps {
  open: boolean;
  onClose: () => void;
  vendorName: string;
  totalAmount: number;
  initialMethods?: PaymentMethod[];
  onSave: (methods: PaymentMethod[]) => void;
}

export function PaymentMethodModal({
  open,
  onClose,
  vendorName,
  totalAmount,
  initialMethods,
  onSave,
}: PaymentMethodModalProps) {
  const [methods, setMethods] = useState<PaymentMethod[]>(() =>
    initialMethods && initialMethods.length > 0 ? initialMethods : [makeMethod(1, totalAmount)]
  );

  const handleSave = useCallback(() => {
    onSave(methods);
    onClose();
  }, [methods, onSave, onClose]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <DialogTitle className="text-lg font-semibold">Payment Method</DialogTitle>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
              {vendorName}
            </span>
          </div>
        </DialogHeader>

        <PaymentMethodForm
          methods={methods}
          onMethodsChange={setMethods}
          totalAmount={totalAmount}
        />

        <div className="flex justify-end gap-3 pt-2 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave}>
            Simpan ({methods.length})
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
