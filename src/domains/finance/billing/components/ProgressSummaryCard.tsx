import { formatCurrencyIDR } from '@/shared/utils/format';
import { BILLING_LABELS } from '../constants';
import type { BillingProjectDetail } from '../types';

type ProgressSummaryCardProps = {
  detail: BillingProjectDetail;
};

const L = BILLING_LABELS.DETAIL;

export function ProgressSummaryCard({ detail }: ProgressSummaryCardProps) {
  const paidPercentage = detail?.summary?.paidBillingPercentage ?? 0;
  const readyPercentage = detail?.summary?.readyToBillPercentage ?? 0;
  const unworkedPercentage = detail?.summary?.unworkedPercentage ?? 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white">
      <div className="border-b border-slate-100 p-5">
        <h3 className="text-sm font-semibold text-slate-950">{L.BILLING_SUMMARY}</h3>
      </div>
      <div className="p-5">
        <div className="mb-6 flex flex-col gap-2 text-sm text-slate-600 md:flex-row md:items-center md:gap-8">
          <p>
            {L.FIELDS.TOTAL_VALUE}{' '}
            <span className="font-semibold text-slate-900">
              {formatCurrencyIDR(detail?.project?.totalValue ?? 0)}
            </span>
          </p>
          <p>
            {L.FIELDS.ESTIMATED_VALUE}{' '}
            <span className="font-semibold text-slate-900">
              {formatCurrencyIDR(detail.project.actualValue ?? 0)}
            </span>
          </p>
        </div>

        <div className="mb-4 flex h-3 w-full overflow-hidden rounded-full bg-slate-100">
          <div className="bg-teal-500" style={{ width: `${paidPercentage}%` }} />
          <div className="bg-blue-500" style={{ width: `${readyPercentage}%` }} />
          <div className="bg-slate-300" style={{ width: `${unworkedPercentage}%` }} />
        </div>

        <div className="mb-6 flex flex-col gap-3 text-xs text-slate-500 md:flex-row md:flex-wrap md:gap-6">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-teal-500" />
            <span>
              {L.SUMMARY.PAID_BILLING} ({paidPercentage}%)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-blue-500" />
            <span>
              {L.SUMMARY.READY_TO_BILL} ({readyPercentage}%)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-slate-300" />
            <span>
              {L.SUMMARY.UNWORKED} ({unworkedPercentage}%)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-medium text-slate-500">{L.SUMMARY.PAID_AMOUNT}</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">
              {formatCurrencyIDR(detail?.summary?.paidBillingAmount ?? 0)}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-medium text-slate-500">{L.SUMMARY.REMAINING_AMOUNT}</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">
              {formatCurrencyIDR(detail?.summary?.remainingBillingAmount ?? 0)}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-medium text-slate-500">{L.SUMMARY.READY_AMOUNT}</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">
              {formatCurrencyIDR(detail?.summary?.readyToBillAmount ?? 0)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
