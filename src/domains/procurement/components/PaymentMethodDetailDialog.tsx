'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import type { PaymentMethod } from '../types/po-finalize';
import { isGiroPayment } from '../types/po-finalize';

interface PaymentMethodDetailDialogProps {
  open: boolean;
  onClose: () => void;
  vendorName: string;
  paymentMethod: PaymentMethod;
}

function formatCurrency(v: number) {
  return v.toLocaleString('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  });
}

function formatDate(dateStr?: string) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
}

function getTypeSpecificFields(pm: PaymentMethod): { label: string; value: string }[] {
  const fields: { label: string; value: string }[] = [];

  if (isGiroPayment(pm.paymentTypeCode)) {
    if (pm.bankName) fields.push({ label: 'Bank', value: pm.bankName });
    if (pm.checkNumber) fields.push({ label: 'No. Cek/Giro', value: pm.checkNumber });
    if (pm.issueDate) fields.push({ label: 'Tgl Terbit', value: formatDate(pm.issueDate) });
    if (pm.effectiveDate)
      fields.push({ label: 'Tgl Berlaku', value: formatDate(pm.effectiveDate) });
    if (pm.notes) fields.push({ label: 'Catatan', value: pm.notes });
  } else {
    // cash_transfer or other
    if (pm.notes) fields.push({ label: 'Catatan', value: pm.notes });
  }
  return fields;
}

export function PaymentMethodDetailDialog({
  open,
  onClose,
  vendorName,
  paymentMethod,
}: PaymentMethodDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <DialogTitle className="text-lg font-semibold">Detail Payment Method</DialogTitle>
          </div>
          <div>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
              {vendorName}
            </span>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500">Jenis Pembayaran</p>
            <p className="text-sm text-slate-800">{paymentMethod.paymentTypeLabel}</p>
          </div>

          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500">Nominal</p>
            <p className="text-lg font-bold text-slate-900">
              {formatCurrency(paymentMethod.amount)}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500">Urutan</p>
            <p className="text-sm text-slate-800">Metode Pembayaran {paymentMethod.order}</p>
          </div>

          {getTypeSpecificFields(paymentMethod).length > 0 && (
            <div className="pt-2 border-t border-slate-200 space-y-3">
              {getTypeSpecificFields(paymentMethod).map((field, idx) => (
                <div key={idx} className="space-y-1">
                  <p className="text-xs font-semibold text-slate-500">{field.label}</p>
                  <p className="text-sm text-slate-800">{field.value}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Tutup
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
