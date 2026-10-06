import { Label } from '@/shared/components/ui';
import { formatCurrencyIDR as formatCurrency } from '@/shared/utils/format';
import { PAYMENT_REQUEST_LABELS } from '../constants';
import type { PaymentRequestDetail } from '../types';

interface PaymentRequestSourceCardProps {
  paymentRequest: PaymentRequestDetail;
}

export function PaymentRequestSourceCard({ paymentRequest }: PaymentRequestSourceCardProps) {
  const source = paymentRequest.source;
  const labels = PAYMENT_REQUEST_LABELS.DETAIL;

  return (
    <div className="flex flex-col gap-4 rounded-lg border p-4">
      <h3 className="text-sm font-semibold text-slate-700">{labels.SOURCE}</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <Label className="text-sm font-normal text-slate-500">{labels.SOURCE_CODE}</Label>
          <p className="text-sm font-medium text-slate-950">{source.code}</p>
        </div>

        <div className="flex flex-col gap-1">
          <Label className="text-sm font-normal text-slate-500">{labels.SOURCE_TYPE}</Label>
          <p className="text-sm font-medium text-slate-950">{paymentRequest.sourceTypeLabel}</p>
        </div>

        {source.paymentMethodLabel && (
          <div className="flex flex-col gap-1">
            <Label className="text-sm font-normal text-slate-500">{labels.PAYMENT_METHOD}</Label>
            <p className="text-sm font-medium text-slate-950">{source.paymentMethodLabel}</p>
          </div>
        )}

        <div className="flex flex-col gap-1">
          <Label className="text-sm font-normal text-slate-500">Total Amount</Label>
          <p className="text-sm font-medium text-slate-950">{formatCurrency(source.totalAmount)}</p>
        </div>
      </div>

      {paymentRequest.notes && (
        <div className="flex flex-col gap-1">
          <Label className="text-sm font-normal text-slate-500">{labels.NOTES}</Label>
          <p className="text-sm text-slate-700">{paymentRequest.notes}</p>
        </div>
      )}
    </div>
  );
}
