'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { ArrowUpRightFromSquare, ChevronLeft, Pencil, Printer, Send } from 'lucide-react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import { Button as AtomButton } from '@/shared/components/atoms';
import { ItemNotFound } from '@/shared/components/molecules';
import { DataTable } from '@/shared/components/organisms/DataTable';
import { FormPageSkeleton } from '@/shared/components/templates';
import { Button } from '@/shared/components/ui';
import { useSelectedCompanyStore } from '@/shared/store/selected-company';
import { formatCurrencyIDR, formatDate } from '@/shared/utils/format';
import {
  CancelBillingModal,
  MarkClearedModal,
  PayBillingModal,
  SetAsInvoicedModal,
  StatusBadge,
} from '../components';
import {
  BILLING_ACTION_LABELS,
  BILLING_PAYMENT_METHOD_LABELS,
  BILLING_RECORD_DETAIL_LABELS,
  BILLING_SECTION_LABELS,
} from '../constants';
import { useBilling } from '../hooks/use-billing';
import { useBillingDocuments } from '../hooks/use-billing-documents';
import { useBillingProgressDetail } from '../hooks/use-billing-progress-detail';
import { useBillingRecordDetail } from '../hooks/use-billing-record-detail';
import { useExportBillingProgressPdf } from '../hooks/use-export-billing-progress-pdf';
import type {
  Billing,
  BillingDocumentRequirement,
  BillingProgressDetailItem,
  BillingRecordDetailData,
} from '../types';

const L = BILLING_RECORD_DETAIL_LABELS;
const BILLING_PAYMENT_PROOF_DOCUMENT_CODE = 'BILLING_PAYMENT_PROOF';

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-right text-sm font-semibold text-slate-950">{value}</span>
    </div>
  );
}

function SummaryBox({
  label,
  value,
  highlighted = false,
}: {
  label: string;
  value: string;
  highlighted?: boolean;
}) {
  return (
    <div
      className={
        highlighted
          ? 'rounded-2xl bg-teal-500 p-5 text-white'
          : 'rounded-2xl border border-slate-200 bg-white p-5'
      }
    >
      <p className={highlighted ? 'text-sm text-white/80' : 'text-sm text-slate-500'}>{label}</p>
      <p className="mt-2 text-xl font-semibold">{value}</p>
    </div>
  );
}

function DocumentChips({ requirements }: { requirements: BillingDocumentRequirement[] }) {
  const items = requirements.flatMap((item) =>
    item.uploadedDocuments.map((doc) => ({
      ...doc,
      typeName: item.documentTypeName,
    }))
  );

  if (items.length === 0) {
    return <p className="text-sm text-slate-500">{L.DOCUMENTS_EMPTY}</p>;
  }

  return (
    <div className="flex flex-wrap items-start gap-3">
      {items.map((item) => (
        <a
          key={item.id}
          href={item.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex max-w-full items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-xs transition-colors hover:bg-slate-50"
        >
          <span className="max-w-60 truncate text-sm leading-5 font-medium text-slate-950">
            {item.typeName}
          </span>
          <ArrowUpRightFromSquare className="h-4 w-4 shrink-0 text-slate-500" strokeWidth={2.25} />
        </a>
      ))}
    </div>
  );
}

function getProgressColumns(): ColumnDef<BillingProgressDetailItem, unknown>[] {
  return [
    {
      accessorKey: 'boqName',
      header: L.PROGRESS_COLUMNS.BOQ,
      size: 200,
    },
    {
      accessorKey: 'weightPercentage',
      header: L.PROGRESS_COLUMNS.WEIGHT,
      size: 100,
      cell: ({ getValue }) => `${getValue<number>()}%`,
    },
    {
      accessorKey: 'actualProgressPercentage',
      header: L.PROGRESS_COLUMNS.ACTUAL_PROGRESS,
      size: 140,
      cell: ({ getValue }) => `${getValue<number>()}%`,
    },
    {
      accessorKey: 'billedProgressPercentage',
      header: L.PROGRESS_COLUMNS.BILLED_PROGRESS,
      size: 160,
      cell: ({ getValue }) => `${getValue<number>()}%`,
    },
    {
      accessorKey: 'billingAmount',
      header: L.PROGRESS_COLUMNS.BILLING_AMOUNT,
      size: 160,
      cell: ({ getValue }) => formatCurrencyIDR(getValue<number>()),
      meta: { headerClassName: 'text-right', cellClassName: 'text-right' },
    },
  ];
}

function BillingRecordDetailView({
  detail,
  billing,
  requirements,
  recordDetail,
  progressItems,
  companyId,
  projectId,
  onBack,
  onOpenPublish,
  onOpenPay,
  onOpenMarkCleared,
  onOpenCancel,
  onPrint,
  isPrinting,
}: {
  detail: NonNullable<ReturnType<typeof useBilling>['data']>['data'];
  billing: Billing;
  requirements: BillingDocumentRequirement[];
  recordDetail?: BillingRecordDetailData;
  progressItems: BillingProgressDetailItem[];
  companyId: string;
  projectId: string;
  onBack: () => void;
  onOpenPublish: (billing: Billing) => void;
  onOpenPay: (billing: Billing) => void;
  onOpenMarkCleared: (billing: Billing) => void;
  onOpenCancel: (billing: Billing) => void;
  onPrint: () => void;
  isPrinting: boolean;
}) {
  const router = useRouter();
  const recordBilling = recordDetail?.billing;
  const primaryAccount = recordBilling?.bankAccounts[0];
  const primaryTax = recordBilling?.taxes[0];
  const vatAmount = primaryTax?.taxAmount ?? 0;
  const baseAmount = recordBilling?.amount ?? billing.amount ?? 0;
  const totalAmount = baseAmount + vatAmount;
  const isDraft = billing.status === 'draft';
  const isPaid = billing.status === 'paid';
  const isCancelled = billing.status === 'cancelled';
  const isPendingPayment = billing.status === 'invoiced' || billing.status === 'pendingClearance';
  const paymentMethodValue = recordBilling?.paymentMethod ?? billing.paymentMethod;
  const paymentMethodLabel = paymentMethodValue
    ? (BILLING_PAYMENT_METHOD_LABELS[
        paymentMethodValue as keyof typeof BILLING_PAYMENT_METHOD_LABELS
      ] ?? paymentMethodValue)
    : '-';

  const paymentProofDocuments = recordBilling?.paymentProof ? [recordBilling.paymentProof] : [];

  const progressColumns = getProgressColumns();

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-4">
          <AtomButton variant="outline" size="md" onClick={onBack} aria-label="Back">
            <ChevronLeft className="h-4 w-4" />
          </AtomButton>
          <div>
            <h1 className="text-lg font-semibold text-slate-950">{billing.code}</h1>
            <p className="mt-1 text-sm text-slate-500">
              {detail.project.code} - {detail.project.name}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!isPaid && !isCancelled && (
            <Button
              variant="outline"
              className="h-9 border-red-200 px-4 text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-600"
              onClick={() => onOpenCancel(billing)}
            >
              {BILLING_ACTION_LABELS.CANCEL}
            </Button>
          )}
          {isPendingPayment && billing.status === 'pendingClearance' && (
            <Button
              variant="outline"
              className="h-9 border-slate-200 px-4 text-sm font-medium text-slate-950"
              onClick={() => onOpenMarkCleared(billing)}
            >
              {BILLING_ACTION_LABELS.MARK_CLEARED}
            </Button>
          )}
          {isPendingPayment && billing.status === 'invoiced' && (
            <Button
              variant="outline"
              className="h-9 border-slate-200 px-4 text-sm font-medium text-slate-950"
              onClick={() => onOpenPay(billing)}
            >
              {BILLING_ACTION_LABELS.PAY}
            </Button>
          )}
          {isDraft && (
            <Button
              variant="outline"
              className="h-9 border-slate-200 px-4 text-sm font-medium text-slate-950"
              onClick={() =>
                router.push(
                  `/finance/billings/${projectId}/create?companyId=${companyId}&billingRecordId=${billing.id}`
                )
              }
            >
              <Pencil className="mr-2 h-4 w-4" />
              {BILLING_ACTION_LABELS.EDIT}
            </Button>
          )}
          <Button
            variant="outline"
            className="h-9 border-slate-200 px-4 text-sm font-medium text-slate-950"
            onClick={onPrint}
            disabled={isPrinting}
          >
            <Printer className="mr-2 h-4 w-4" />
            {L.PRINT_BUTTON}
          </Button>
          {isDraft && (
            <Button
              className="h-9 bg-blue-600 px-4 text-sm font-medium hover:bg-blue-700"
              onClick={() => onOpenPublish(billing)}
            >
              <Send className="mr-2 h-4 w-4" />
              {L.PUBLISH_BUTTON}
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-slate-950">{L.BILLING_INFO_TITLE}</h2>
            <div className="mt-4 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <span className="text-sm text-slate-500">{L.FIELDS.BILLING_NUMBER}</span>
                <span className="text-sm font-semibold text-slate-950">{billing.code}</span>
              </div>
              <div className="flex items-start justify-between gap-4">
                <span className="text-sm text-slate-500">{L.FIELDS.STATUS}</span>
                <div className="flex items-center gap-2">
                  <StatusBadge status={billing.status} />
                </div>
              </div>
              <div className="flex items-start justify-between gap-4">
                <span className="text-sm text-slate-500">{L.FIELDS.TERM}</span>
                <span className="text-sm font-semibold text-slate-950">
                  {billing.termNumber ? `Termin ${billing.termNumber}` : '-'}
                </span>
              </div>
              <div className="flex items-start justify-between gap-4">
                <span className="text-sm text-slate-500">{L.FIELDS.CLIENT}</span>
                <span className="text-sm font-semibold text-slate-950">
                  {detail.project.client?.name ?? '-'}
                </span>
              </div>
              <div className="flex items-start justify-between gap-4">
                <span className="text-sm text-slate-500">{L.FIELDS.PIC}</span>
                <span className="text-sm font-semibold text-slate-950">
                  {detail.project.pic?.name ?? '-'}
                </span>
              </div>
              <div className="flex items-start justify-between gap-4">
                <span className="text-sm text-slate-500">{L.FIELDS.TYPE}</span>
                <span className="text-sm font-semibold text-slate-950">
                  {detail.project.projectType?.name ?? '-'}
                </span>
              </div>
              <div className="flex items-start justify-between gap-4">
                <span className="text-sm text-slate-500">{L.FIELDS.PROJECT_START}</span>
                <span className="text-sm font-semibold text-slate-950">
                  {detail.project.projectStartDate
                    ? formatDate(detail.project.projectStartDate)
                    : '-'}
                </span>
              </div>
              <div className="flex items-start justify-between gap-4">
                <span className="text-sm text-slate-500">{L.FIELDS.PROJECT_END}</span>
                <span className="text-sm font-semibold text-slate-950">
                  {detail.project.projectEndDate ? formatDate(detail.project.projectEndDate) : '-'}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-slate-950">{L.PAYMENT_INFO_TITLE}</h2>
            <div className="mt-4">
              <InfoRow label={L.FIELDS.PAYMENT_METHOD} value={paymentMethodLabel} />
              <InfoRow
                label={L.FIELDS.RECIPIENT_ACCOUNT}
                value={
                  primaryAccount
                    ? `${primaryAccount.bankName} - ${primaryAccount.accountNumber}`
                    : '-'
                }
              />
              <InfoRow label={L.FIELDS.ACCOUNT_NAME} value={primaryAccount?.accountName ?? '-'} />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-slate-950">
              {BILLING_SECTION_LABELS.PROOF_PAYMENT}
            </h2>
            <div className="mt-4">
              <DocumentChips requirements={paymentProofDocuments} />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-slate-950">{L.DOCUMENTS_TITLE}</h2>
            <div className="mt-4">
              <DocumentChips requirements={requirements} />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-slate-950">{L.NOTES_TITLE}</h2>
            <p className="mt-4 text-sm leading-6 text-slate-600">{billing.notes ?? '-'}</p>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-slate-950">{L.PAYMENT_SUMMARY_TITLE}</h2>
            <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1fr_1.15fr]">
              <SummaryBox label={L.SUMMARY.BASE_VALUE} value={formatCurrencyIDR(baseAmount)} />
              <SummaryBox
                label={
                  primaryTax
                    ? `${primaryTax.taxName} ${primaryTax.percentage}%`
                    : L.SUMMARY.VAT_DEFAULT
                }
                value={formatCurrencyIDR(vatAmount)}
              />
              <SummaryBox
                label={L.SUMMARY.TOTAL_BILLING}
                value={formatCurrencyIDR(totalAmount)}
                highlighted
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-5">
              <h2 className="text-base font-semibold text-slate-950">{L.PROGRESS_CLIENT_TITLE}</h2>
            </div>
            <DataTable<BillingProgressDetailItem, unknown>
              columns={progressColumns}
              data={progressItems}
              enablePagination
              emptyMessage={L.PROGRESS_EMPTY}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function BillingRecordDetailPage() {
  const router = useRouter();
  const params = useParams<{ id?: string; billingId?: string }>();
  const projectId = params.id ?? '';
  const billingId = params.billingId ?? '';
  const searchParams = useSearchParams();
  const selectedCompanyId = useSelectedCompanyStore((state) => state.selectedCompanyId);
  const companyId = searchParams.get('companyId') ?? selectedCompanyId ?? '';

  const [publishBilling, setPublishBilling] = useState<Billing | null>(null);
  const [payBilling, setPayBilling] = useState<Billing | null>(null);
  const [markClearedBilling, setMarkClearedBilling] = useState<Billing | null>(null);
  const [cancelBilling, setCancelBilling] = useState<Billing | null>(null);

  const { data, isLoading } = useBilling({
    billingId: projectId,
    companyId: companyId || undefined,
  });
  const detail = data?.data;

  const billing = useMemo(() => {
    if (!detail || !billingId) return null;
    return (
      [...detail.billing.active, ...detail.billing.history].find((b) => b.id === billingId) ?? null
    );
  }, [detail, billingId]);

  const { data: documentsData } = useBillingDocuments({
    billingId: billing?.id ?? '',
    companyId: companyId || undefined,
  });
  const { data: recordDetailData } = useBillingRecordDetail({
    billingId,
    companyId: companyId || undefined,
  });
  const { data: progressDetailData } = useBillingProgressDetail({
    billingId,
    companyId: companyId || undefined,
  });
  const requirePaymentProof =
    recordDetailData?.data.documentRequirements.some(
      (item) => item.documentTypeCode === BILLING_PAYMENT_PROOF_DOCUMENT_CODE
    ) ?? false;
  const { handleExport: handlePrint, isExporting: isPrinting } = useExportBillingProgressPdf();

  const handleBack = useCallback(() => {
    router.push(`/finance/billings/${projectId}${companyId ? `?companyId=${companyId}` : ''}`);
  }, [router, projectId, companyId]);

  if (isLoading) return <FormPageSkeleton />;

  if (!detail || !billing) {
    return <ItemNotFound message={L.NOT_FOUND} onBack={handleBack} />;
  }

  return (
    <>
      <BillingRecordDetailView
        detail={detail}
        billing={billing}
        requirements={documentsData?.data?.requirements ?? []}
        recordDetail={recordDetailData?.data}
        progressItems={progressDetailData?.data.items ?? []}
        companyId={companyId}
        projectId={projectId}
        onBack={handleBack}
        onOpenPublish={setPublishBilling}
        onOpenPay={setPayBilling}
        onOpenMarkCleared={setMarkClearedBilling}
        onOpenCancel={setCancelBilling}
        onPrint={() => handlePrint({ billingId, companyId: companyId || undefined })}
        isPrinting={isPrinting}
      />

      <SetAsInvoicedModal
        open={Boolean(publishBilling)}
        billing={publishBilling}
        companyId={companyId}
        onClose={() => setPublishBilling(null)}
      />
      <PayBillingModal
        open={Boolean(payBilling)}
        billing={payBilling}
        companyId={companyId}
        requireProof={requirePaymentProof}
        documentRequirements={recordDetailData?.data.documentRequirements}
        onClose={() => setPayBilling(null)}
      />
      <MarkClearedModal
        open={Boolean(markClearedBilling)}
        billing={markClearedBilling}
        companyId={companyId}
        onClose={() => setMarkClearedBilling(null)}
      />
      <CancelBillingModal
        open={Boolean(cancelBilling)}
        billing={cancelBilling}
        companyId={companyId}
        onClose={() => setCancelBilling(null)}
      />
    </>
  );
}
