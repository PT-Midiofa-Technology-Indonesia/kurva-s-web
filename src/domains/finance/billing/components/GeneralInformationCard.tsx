import { Building2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { formatDate } from '@/shared/utils/format';
import { BILLING_LABELS } from '../constants';
import type { BillingStatus } from '../types';
import { StatusBadge } from './StatusBadge';

type GeneralInformationCardProps = {
  detail: any;
  statusContent?: ReactNode;
};

const L = BILLING_LABELS.DETAIL;

function MetricCard({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-medium text-slate-500">{label}</p>
      <p className="font-medium text-slate-900">{value}</p>
    </div>
  );
}

export function GeneralInformationCard({ detail, statusContent }: GeneralInformationCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white">
      <div className="border-b border-slate-100 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
            <Building2 className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-semibold text-slate-950">{L.GENERAL_INFORMATION}</h3>
        </div>
      </div>
      <div className="flex flex-col gap-5 p-5">
        <MetricCard
          label={L.FIELDS.COMPANY}
          value={detail?.project?.company?.name ?? detail?.company?.name ?? '-'}
        />
        <div>
          <p className="mb-1.5 text-xs font-medium text-slate-500">{L.FIELDS.STATUS}</p>
          {statusContent ?? (
            <StatusBadge status={(detail?.status as BillingStatus) ?? ('draft' as BillingStatus)} />
          )}
        </div>
        <MetricCard label={L.FIELDS.PROJECT} value={detail?.project?.name ?? detail?.name ?? '-'} />
        <MetricCard
          label={L.FIELDS.CLIENT}
          value={detail?.project?.client?.name ?? detail?.client?.name ?? '-'}
        />
        <MetricCard
          label={L.FIELDS.PIC}
          value={detail?.project?.pic?.name ?? detail?.pic?.name ?? '-'}
        />
        <MetricCard
          label={L.FIELDS.PROJECT_TYPE}
          value={detail?.project?.projectType?.name ?? detail?.billingType ?? '-'}
        />
        <MetricCard
          label={L.FIELDS.START}
          value={
            detail?.project?.projectStartDate ? formatDate(detail?.project?.projectStartDate) : '-'
          }
        />
        <MetricCard
          label={L.FIELDS.END}
          value={
            detail?.project?.projectEndDate ? formatDate(detail?.project?.projectEndDate) : '-'
          }
        />
      </div>
    </div>
  );
}
