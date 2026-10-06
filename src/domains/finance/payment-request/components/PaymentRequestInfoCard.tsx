import { Label } from '@/shared/components/ui';
import { formatCurrencyIDR as formatCurrency } from '@/shared/utils/format';
import { PAYMENT_REQUEST_LABELS } from '../constants';
import type { PaymentRequestDetail } from '../types';

interface PaymentRequestInfoCardProps {
  paymentRequest: PaymentRequestDetail;
}

export function PaymentRequestInfoCard({ paymentRequest }: PaymentRequestInfoCardProps) {
  const labels = PAYMENT_REQUEST_LABELS.DETAIL;

  return (
    <div className="flex flex-col gap-4 rounded-lg border p-4">
      <h3 className="text-sm font-semibold text-slate-700">{labels.INFO}</h3>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <Label className="text-sm font-normal text-slate-500">{labels.AMOUNT}</Label>
          <p className="text-sm font-medium text-slate-950">
            {formatCurrency(paymentRequest.amount)}
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <Label className="text-sm font-normal text-slate-500">{labels.STATUS}</Label>
          <p className="text-sm font-medium text-slate-950">{paymentRequest.statusLabel}</p>
        </div>

        <div className="flex flex-col gap-1">
          <Label className="text-sm font-normal text-slate-500">{labels.PAID_AMOUNT}</Label>
          <p className="text-sm font-medium text-slate-950">
            {formatCurrency(paymentRequest.paidAmount)}
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <Label className="text-sm font-normal text-slate-500">{labels.REMAINING}</Label>
          <p className="text-sm font-medium text-slate-950">
            {formatCurrency(paymentRequest.remainingAmount)}
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <Label className="text-sm font-normal text-slate-500">{labels.DUE_DATE}</Label>
          <p className="text-sm font-medium text-slate-950">
            {paymentRequest.dueDate
              ? new Date(paymentRequest.dueDate).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })
              : '-'}
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <Label className="text-sm font-normal text-slate-500">{labels.SOURCE_TYPE}</Label>
          <p className="text-sm font-medium text-slate-950">{paymentRequest.sourceTypeLabel}</p>
        </div>
      </div>
    </div>
  );
}
