'use client';

import type { ColumnDef } from '@tanstack/react-table';
import {
  Check,
  CircleDollarSign,
  Download,
  EllipsisVertical,
  Eye,
  FileText,
  Pencil,
  Plus,
  X,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import {
  CancelBillingModal,
  GeneralInformationCard,
  MarkClearedModal,
  PayBillingModal,
  ProgressSummaryCard,
  SetAsInvoicedModal,
  StatusBadge,
} from '@/domains/finance/billing/components';
import { useQueryParams } from '@/hooks/use-query-params';
import { ItemNotFound, PageHeader } from '@/shared/components/molecules';
import { DataTable } from '@/shared/components/organisms/DataTable';
import { FormPageSkeleton } from '@/shared/components/templates';
import { Button } from '@/shared/components/ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { useSelectedCompanyStore } from '@/shared/store/selected-company';
import type { BaseQueryParams } from '@/shared/types/query-params';
import { formatCurrencyIDR, formatDate } from '@/shared/utils/format';
import { BILLING_ACTION_LABELS, BILLING_LABELS } from '../constants';
import { useBilling } from '../hooks/use-billing';
import { useExportBillingProgressPdf } from '../hooks/use-export-billing-progress-pdf';
import { getBillingActions } from '../services';
import type { Billing } from '../types';

interface BillingDetailUrlParams extends BaseQueryParams {
  companyId?: string;
}

const L = BILLING_LABELS.DETAIL;
const BILLING_PAYMENT_PROOF_DOCUMENT_CODE = 'BILLING_PAYMENT_PROOF';

function getBillingTermLabel(billing: Billing) {
  return billing.termNumber != null ? `Termin ${billing.termNumber}` : 'Termin -';
}

function getBillingPaidAmount(billing: Billing) {
  return billing.status === 'paid' || billing.status === 'pendingClearance'
    ? (billing.amount ?? 0)
    : 0;
}

function getActiveBillingMeta(billing: Billing) {
  return {
    termLabel: getBillingTermLabel(billing),
    createdLabel: billing.billedAt ? `Dibuat ${formatDate(billing.billedAt)}` : 'Tanggal tagihan -',
    dueLabel: billing.dueDate ? `Jatuh Tempo ${formatDate(billing.dueDate)}` : 'Jatuh Tempo -',
  };
}

function ProjectStatusBadge({ hasActiveBilling }: { hasActiveBilling: boolean }) {
  const label = hasActiveBilling
    ? BILLING_LABELS.LIST.STATUS.HAS_BILLING
    : BILLING_LABELS.LIST.STATUS.NO_BILLING;

  return (
    <span
      className={
        hasActiveBilling
          ? 'inline-flex items-center rounded-full bg-orange-500 px-3 py-1 text-xs font-semibold text-white'
          : 'inline-flex items-center rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white'
      }
    >
      {label}
    </span>
  );
}

function EmptyBillingState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-100 text-slate-900">
        <FileText className="h-10 w-10" strokeWidth={1.75} />
      </div>
      <p className="text-xl font-semibold text-slate-950">{title}</p>
      <p className="mt-2 max-w-md text-sm text-slate-500">{description}</p>
    </div>
  );
}

function BillingActionMenu({
  billing,
  onViewDetail,
  onEdit,
  onSetAsInvoiced,
  onPay,
  onMarkCleared,
  onCancel,
  onDownloadPdf,
  isDownloadingPdf,
}: {
  billing: Billing;
  onViewDetail: (id: string) => void;
  onEdit: (id: string) => void;
  onSetAsInvoiced: (billing: Billing) => void;
  onPay: (billing: Billing) => void;
  onMarkCleared: (billing: Billing) => void;
  onCancel: (billing: Billing) => void;
  onDownloadPdf: (billing: Billing) => void;
  isDownloadingPdf: boolean;
}) {
  const actions = getBillingActions(billing);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-slate-200">
          <EllipsisVertical className="h-4 w-4 text-slate-950" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-55 rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_12px_32px_rgba(15,23,42,0.12)]"
      >
        {actions.canSetAsInvoiced && (
          <DropdownMenuItem
            onClick={() => onSetAsInvoiced(billing)}
            className="gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium text-slate-900 [&_svg]:text-slate-500"
          >
            <FileText className="h-4 w-4" />
            {BILLING_ACTION_LABELS.SET_AS_INVOICED}
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          onClick={() => onViewDetail(billing.id)}
          className="gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium text-slate-900 [&_svg]:text-slate-500"
        >
          <Eye className="h-4 w-4" />
          {BILLING_ACTION_LABELS.DETAIL}
        </DropdownMenuItem>
        {billing.status === 'draft' && (
          <DropdownMenuItem
            onClick={() => onEdit(billing.id)}
            className="gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium text-slate-900 [&_svg]:text-slate-500"
          >
            <Pencil className="h-4 w-4" />
            {BILLING_ACTION_LABELS.EDIT}
          </DropdownMenuItem>
        )}
        {actions.canDownloadPdf && (
          <DropdownMenuItem
            onClick={() => onDownloadPdf(billing)}
            disabled={isDownloadingPdf}
            className="gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium text-slate-900 [&_svg]:text-slate-500"
          >
            <Download className="h-4 w-4" />
            {BILLING_ACTION_LABELS.DOWNLOAD_PDF}
          </DropdownMenuItem>
        )}
        {(actions.canSetAsInvoiced || actions.canPay || actions.canMarkCleared) && (
          <DropdownMenuSeparator className="mx-2 my-2 bg-slate-200" />
        )}
        {actions.canPay && (
          <DropdownMenuItem
            onClick={() => onPay(billing)}
            className="gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium text-slate-900 [&_svg]:text-slate-500"
          >
            <CircleDollarSign className="h-4 w-4" />
            {BILLING_ACTION_LABELS.PAY}
          </DropdownMenuItem>
        )}
        {actions.canMarkCleared && (
          <>
            <DropdownMenuItem
              onClick={() => onMarkCleared(billing)}
              className="gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium text-slate-900 [&_svg]:text-slate-500"
            >
              <Check className="h-4 w-4" />
              {BILLING_ACTION_LABELS.MARK_CLEARED}
            </DropdownMenuItem>
            <DropdownMenuSeparator className="mx-2 my-2 bg-slate-200" />
          </>
        )}
        {actions.canCancel && (
          <DropdownMenuItem
            variant="destructive"
            onClick={() => onCancel(billing)}
            className="gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium"
          >
            <X className="h-4 w-4" />
            {BILLING_ACTION_LABELS.CANCEL}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
export function BillingDetailPage() {
  const router = useRouter();
  const params = useParams<Record<string, string>>();
  const projectId = params.id ?? '';
  const { queryParams } = useQueryParams<BillingDetailUrlParams>();
  const selectedCompanyId = useSelectedCompanyStore((state) => state.selectedCompanyId);
  const companyId = queryParams.companyId ?? selectedCompanyId ?? '';
  const [publishBilling, setPublishBilling] = useState<Billing | null>(null);
  const [payBilling, setPayBilling] = useState<Billing | null>(null);
  const [markClearedBilling, setMarkClearedBilling] = useState<Billing | null>(null);
  const [cancelBilling, setCancelBilling] = useState<Billing | null>(null);

  const { data, isLoading } = useBilling({
    billingId: projectId,
    companyId: companyId || undefined,
  });
  const { handleExport: handleDownloadPdf, isExporting: isDownloadingPdf } =
    useExportBillingProgressPdf();
  const detail = data?.data;
  const requirePaymentProof =
    detail?.documentRequirements.some(
      (item) => item.documentTypeCode === BILLING_PAYMENT_PROOF_DOCUMENT_CODE
    ) ?? false;

  const handleBack = useCallback(() => {
    router.push(`/finance/billings${companyId ? `?companyId=${companyId}` : ''}`);
  }, [router, companyId]);

  const handleCreateBilling = useCallback(() => {
    router.push(
      `/finance/billings/${projectId}/create${companyId ? `?companyId=${companyId}` : ''}`
    );
  }, [router, projectId, companyId]);

  const historyColumns: ColumnDef<Billing>[] = [
    {
      accessorKey: 'code',
      header: 'Nomor Tagihan',
      cell: ({ getValue }) => (
        <span className="font-medium text-slate-950">{getValue<string>()}</span>
      ),
    },
    {
      id: 'termin',
      header: 'Termin',
      cell: ({ row }) => getBillingTermLabel(row.original),
    },
    {
      id: 'nilai',
      header: 'Nilai',
      cell: ({ row }) => formatCurrencyIDR(row.original.amount ?? 0),
    },
    {
      id: 'dibayar',
      header: 'Dibayar',
      cell: ({ row }) => formatCurrencyIDR(getBillingPaidAmount(row.original)),
    },
    {
      id: 'tglBayar',
      header: 'Tgl Bayar',
      cell: ({ row }) => (row.original.paidAt ? formatDate(row.original.paidAt) : '-'),
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: 'action',
      header: 'Action',
      cell: ({ row }) => {
        const billingId = row.original.id;
        return (
          <div className="flex justify-center">
            <Button
              variant="ghost"
              className="h-8 w-8 p-0"
              onClick={() =>
                router.push(
                  `/finance/billings/${projectId}/records/${billingId}${companyId ? `?companyId=${companyId}` : ''}`
                )
              }
            >
              <Eye className="h-4 w-4 text-slate-950" />
            </Button>
          </div>
        );
      },
    },
  ];

  if (isLoading) {
    return <FormPageSkeleton />;
  }

  if (!detail) {
    return <ItemNotFound message="Data tidak ditemukan." onBack={handleBack} />;
  }

  const { billing } = detail;
  const hasActiveBilling = billing.active.length > 0;

  return (
    <>
      <div className="flex flex-col gap-6 p-6">
        <PageHeader
          title={detail.project.code}
          onBack={handleBack}
          actions={
            <Button onClick={handleCreateBilling} className="gap-2 bg-teal-600 hover:bg-teal-700">
              <Plus className="h-4 w-4" />
              {L.CREATE_BUTTON}
            </Button>
          }
        />

        <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
          <GeneralInformationCard
            detail={detail}
            statusContent={<ProjectStatusBadge hasActiveBilling={hasActiveBilling} />}
          />

          <div className="flex flex-col gap-6">
            <ProgressSummaryCard detail={detail} />

            <div className="rounded-2xl border border-slate-200 bg-white">
              <div className="border-b border-slate-100 p-5">
                <h2 className="text-sm font-semibold text-slate-950">{L.ACTIVE_BILLING}</h2>
              </div>
              {billing.active.length === 0 ? (
                <EmptyBillingState
                  title={L.ACTIVE_BILLING_EMPTY_TITLE}
                  description={L.ACTIVE_BILLING_EMPTY_DESCRIPTION}
                />
              ) : (
                <div className="flex flex-col gap-4 p-5">
                  {billing.active.map((item) => {
                    const meta = getActiveBillingMeta(item);

                    return (
                      <div
                        key={item.id}
                        className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 p-5"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2 text-base font-semibold text-slate-950">
                            <span>{item.code}</span>
                            <span className="text-slate-300">•</span>
                            <span>{meta.termLabel}</span>
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                            <span>{meta.createdLabel}</span>
                            <span className="text-slate-300">•</span>
                            <span>{formatCurrencyIDR(item.amount ?? 0)}</span>
                          </div>
                          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                            <StatusBadge status={item.status} />
                            <span className="text-slate-300">•</span>
                            <span>{meta.dueLabel}</span>
                          </div>
                        </div>
                        <div className="shrink-0">
                          <BillingActionMenu
                            billing={item}
                            onViewDetail={(billingId) =>
                              router.push(
                                `/finance/billings/${projectId}/records/${billingId}?companyId=${companyId}`
                              )
                            }
                            onEdit={(billingId) =>
                              router.push(
                                `/finance/billings/${projectId}/create?companyId=${companyId}&billingRecordId=${billingId}`
                              )
                            }
                            onSetAsInvoiced={setPublishBilling}
                            onPay={setPayBilling}
                            onMarkCleared={setMarkClearedBilling}
                            onCancel={setCancelBilling}
                            onDownloadPdf={(selectedBilling) =>
                              handleDownloadPdf({
                                billingId: selectedBilling.id,
                                companyId: companyId || undefined,
                              })
                            }
                            isDownloadingPdf={isDownloadingPdf}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white">
              <div className="border-b border-slate-100 p-5">
                <h2 className="text-sm font-semibold text-slate-950">{L.BILLING_HISTORY}</h2>
              </div>
              <DataTable
                columns={historyColumns}
                data={billing.history}
                emptyMessage={L.BILLING_HISTORY_EMPTY}
              />
            </div>
          </div>
        </div>
      </div>

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
        documentRequirements={detail?.documentRequirements}
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
