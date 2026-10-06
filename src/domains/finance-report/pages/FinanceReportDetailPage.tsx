'use client';

import { useParams, useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { useQueryParams } from '@/hooks/use-query-params';
import { ItemNotFound, PageHeader } from '@/shared/components/molecules';
import { FormPageSkeleton } from '@/shared/components/templates';
import { Badge } from '@/shared/components/ui/badge';
import { useSelectedCompanyStore } from '@/shared/store/selected-company';
import type { BaseQueryParams } from '@/shared/types/query-params';
import { formatCurrencyIDR, formatDate } from '@/shared/utils/format';
import {
  FINANCE_REPORT_LABELS,
  FINANCE_REPORT_SOURCE_OPTIONS,
  FINANCE_REPORT_TYPE_BADGE,
  FINANCE_REPORT_TYPE_OPTIONS,
} from '../constants';
import { useFinanceReportDetail } from '../hooks/use-finance-report-detail';
import type { FinanceReportDetail, FinanceReportType } from '../types';

interface FinanceReportDetailUrlParams extends BaseQueryParams {
  companyId?: string;
}

const typeVariant: Record<FinanceReportType, 'success' | 'warning'> = {
  cash_in: FINANCE_REPORT_TYPE_BADGE.cash_in.variant,
  cash_out: FINANCE_REPORT_TYPE_BADGE.cash_out.variant,
};

function humanize(value: string | null | undefined): string {
  return value ? value.replace(/_/g, ' ') : '-';
}

function getOptionLabel(
  options: readonly { value: string; label: string }[],
  value: string
): string {
  return options.find((option) => option.value === value)?.label ?? humanize(value);
}

function DetailItem({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <div className="mt-1 text-base font-semibold text-slate-950">{children}</div>
    </div>
  );
}

function FinanceReportCard({ report }: { report: FinanceReportDetail }) {
  const fields = FINANCE_REPORT_LABELS.DETAIL.FIELDS;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="grid grid-cols-1 gap-x-12 gap-y-8 md:grid-cols-3">
        <DetailItem title={fields.CODE}>{report.code}</DetailItem>
        <DetailItem title={fields.SOURCE}>
          <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-100">
            {getOptionLabel(FINANCE_REPORT_SOURCE_OPTIONS, report.source)}
          </Badge>
        </DetailItem>
        <DetailItem title={fields.REFERENCE}>{report.reference || '-'}</DetailItem>
        <DetailItem title={fields.AMOUNT}>{formatCurrencyIDR(report.amount)}</DetailItem>
        <DetailItem title={fields.TRANSACTION_DATE}>
          {report.transactionDate ? formatDate(report.transactionDate) : '-'}
        </DetailItem>
        <DetailItem title={fields.TYPE}>
          <Badge variant={typeVariant[report.type]}>
            {getOptionLabel(FINANCE_REPORT_TYPE_OPTIONS, report.type)}
          </Badge>
        </DetailItem>
        <div className="md:col-span-3">
          <DetailItem title={fields.DESCRIPTION}>{report.note || '-'}</DetailItem>
        </div>
      </div>
    </div>
  );
}

export function FinanceReportDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const financeReportId = id;
  const { queryParams } = useQueryParams<FinanceReportDetailUrlParams>();
  const selectedCompanyId = useSelectedCompanyStore((state) => state.selectedCompanyId);
  const companyId = queryParams.companyId ?? selectedCompanyId ?? '';

  const { data, isLoading } = useFinanceReportDetail({
    id: financeReportId,
    companyId: companyId || undefined,
  });
  const report = data?.data;

  const handleBack = useCallback(() => {
    router.push(`/finance/finance-report${companyId ? `?companyId=${companyId}` : ''}`);
  }, [router, companyId]);

  if (isLoading) return <FormPageSkeleton />;
  if (!report)
    return <ItemNotFound message={FINANCE_REPORT_LABELS.DETAIL.NOT_FOUND} onBack={handleBack} />;

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader title={report.code} onBack={handleBack} />
      <FinanceReportCard report={report} />
    </div>
  );
}
