'use client';

import type { ColumnDef } from '@tanstack/react-table';
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  ChevronDown,
  Download,
  EllipsisVertical,
  Eye,
  FileText,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { DataTable } from '@/shared/components/organisms';
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Progress,
} from '@/shared/components/ui';
import { COMMON_LABELS } from '@/shared/constants';
import { formatCurrencyIDR as formatCurrency, formatDate } from '@/shared/utils/format';
import { PAYMENT_REQUEST_LABELS } from '../constants';
import type {
  PaymentRequestDetail,
  PaymentRequestEventDocument,
  PaymentRequestEventStatus,
  PaymentRequestSourceItem,
  PaymentRequestStatus,
  PaymentRequestUploadedDocument,
} from '../types';

const labels = PAYMENT_REQUEST_LABELS.DETAIL;

export type ProofDocument = PaymentRequestEventDocument | PaymentRequestUploadedDocument;

const requestStatusClassNames: Record<PaymentRequestStatus, string> = {
  pending: 'border-amber-100 bg-amber-50 text-amber-600',
  approved: 'border-blue-100 bg-blue-50 text-blue-600',
  processing: 'border-blue-100 bg-blue-50 text-blue-600',
  partial_paid: 'border-amber-100 bg-amber-50 text-amber-600',
  paid: 'border-emerald-100 bg-emerald-50 text-emerald-600',
  cancelled: 'border-red-100 bg-red-50 text-red-600',
  rejected: 'border-red-100 bg-red-50 text-red-600',
};

const eventStatusClassNames: Record<PaymentRequestEventStatus, string> = {
  paid: 'border-emerald-100 bg-emerald-50 text-emerald-600',
  pending_clearance: 'border-amber-100 bg-amber-50 text-amber-600',
  cleared: 'border-blue-100 bg-blue-50 text-blue-600',
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-sm text-slate-500">{label}</p>
      <div className="mt-1 text-sm font-medium text-slate-900">{children}</div>
    </div>
  );
}

export function AccordionCard({
  title,
  defaultOpen = true,
  headerContent,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  headerContent?: React.ReactNode;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
      <button
        type="button"
        className="flex w-full cursor-pointer items-center justify-between gap-4 outline-none"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <div className="flex min-w-0 items-center gap-2">
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          {headerContent}
        </div>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-slate-500 transition-transform duration-200 ${
            isOpen ? 'rotate-0' : '-rotate-90'
          }`}
        />
      </button>

      <div
        className={`grid overflow-hidden transition-[grid-template-rows,opacity,margin] duration-300 ease-out ${
          isOpen ? 'mt-4 grid-rows-[1fr] opacity-100' : 'mt-0 grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="min-h-0 overflow-hidden">{children}</div>
      </div>
    </div>
  );
}

export function formatDateTime(date: string | null | undefined) {
  if (!date) return '-';

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jakarta',
    timeZoneName: 'short',
  }).format(new Date(date));
}

export function downloadDocument(url: string, fileName: string) {
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.target = '_blank';
  link.rel = 'noreferrer';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function getRecipientName(paymentRequest: PaymentRequestDetail) {
  return (
    paymentRequest.recipientName ??
    paymentRequest.recipient ??
    paymentRequest.company?.name ??
    paymentRequest.companyName ??
    '-'
  );
}

function formatPeriodRange(start?: string | null, end?: string | null) {
  if (!start && !end) return '-';
  if (start && end) return `${formatDate(start)}${labels.PERIOD_SEPARATOR}${formatDate(end)}`;
  return formatDate(start ?? end ?? '');
}

function getPayrollAccountLabel(item: PaymentRequestSourceItem) {
  if (item.bankName && item.bankAccountNumber) {
    return `${item.bankName} - ${item.bankAccountNumber}`;
  }

  return item.bankName ?? item.bankAccountNumber ?? '-';
}

function getInitials(name?: string | null) {
  if (!name) return '-';

  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  if (parts.length === 0) return '-';

  return parts.map((part) => part[0]?.toUpperCase() ?? '').join('');
}

export function getPaymentRequestReferenceHref(paymentRequest: PaymentRequestDetail) {
  const sourceId = paymentRequest.sourceId || paymentRequest.source?.id;

  if (!sourceId) return null;

  switch (paymentRequest.sourceType) {
    case 'payroll':
      return `/human-resource/payroll/draft/${sourceId}`;
    case 'cost_request':
      return `/expense-management/cost-request/${sourceId}`;
    case 'purchase_order':
      return `/procurement/purchase-order/${sourceId}`;
    default:
      return null;
  }
}

export function ProofPaymentDialog({
  open,
  onClose,
  document,
}: {
  open: boolean;
  onClose: () => void;
  document: ProofDocument | null;
}) {
  const documentUrl = document?.url;

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto p-0 sm:max-w-4xl">
        <DialogHeader className="border-b border-slate-200 px-6 py-4">
          <DialogTitle>{labels.PROOF_PAYMENT}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 px-6 py-5">
          {documentUrl ? (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
              <iframe
                key={documentUrl}
                src={documentUrl}
                title={document?.fileName ?? labels.PROOF_PAYMENT}
                className="h-[75vh] w-full bg-white"
              />
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 px-6 py-12 text-center text-sm text-slate-500">
              Dokumen tidak tersedia.
            </div>
          )}
        </div>

        <DialogFooter className="px-6 py-4">
          <Button type="button" variant="outline" onClick={onClose}>
            {labels.CLOSE}
          </Button>
          <Button
            type="button"
            className="bg-teal-600 hover:bg-teal-700"
            disabled={!documentUrl}
            onClick={() =>
              documentUrl && downloadDocument(documentUrl, document?.fileName ?? 'proof-payment')
            }
          >
            <Download className="mr-2 h-4 w-4" />
            {labels.DOWNLOAD}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function GeneralInformationCard({
  paymentRequest,
  onEditDueDate,
  onOpenReference,
}: {
  paymentRequest: PaymentRequestDetail;
  onEditDueDate: () => void;
  onOpenReference?: () => void;
}) {
  const dueDate = formatDateTime(paymentRequest.dueDate);
  const isOverdue =
    paymentRequest.isOverdue ??
    (paymentRequest.status !== 'paid' &&
      paymentRequest.status !== 'cancelled' &&
      new Date(paymentRequest.dueDate) < new Date());

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs lg:col-span-2">
      <h2 className="text-base font-semibold text-slate-900">{labels.GENERAL_INFORMATION}</h2>

      <div className="mt-6 grid gap-6 lg:grid-cols-3 lg:gap-8">
        <div className="space-y-5">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-teal-600 text-white">
              <Building2 className="h-6 w-6" />
            </div>
            <Field label={labels.COMPANY}>
              {paymentRequest.company?.name ?? paymentRequest.companyName ?? '-'}
            </Field>
          </div>

          <Field label={labels.RECIPIENT}>{getRecipientName(paymentRequest)}</Field>
        </div>

        <div className="space-y-5">
          <Field label={labels.TYPE}>{paymentRequest.sourceTypeLabel}</Field>

          <Field label={labels.DUE_DATE}>
            <div className="flex items-center gap-2">
              <span className={isOverdue ? 'inline-flex items-center gap-1 text-red-500' : ''}>
                {isOverdue && <AlertTriangle className="h-4 w-4" />}
                {dueDate}
              </span>
              <button
                type="button"
                className="text-sm font-medium text-amber-500 hover:underline"
                onClick={onEditDueDate}
              >
                Edit
              </button>
            </div>
          </Field>
        </div>

        <div className="space-y-5">
          <Field label={labels.CODE}>
            <button
              type="button"
              className="text-left font-medium text-teal-600 underline underline-offset-2 disabled:cursor-default disabled:text-slate-900 disabled:no-underline"
              disabled={!onOpenReference}
              onClick={onOpenReference}
            >
              {paymentRequest.source?.code ?? paymentRequest.code}
            </button>
          </Field>

          <Field label={labels.STATUS}>
            <Badge variant="outline" className={requestStatusClassNames[paymentRequest.status]}>
              {paymentRequest.statusLabel}
            </Badge>
          </Field>
        </div>
      </div>

      <div className="mt-6 border-t border-slate-100 pt-5">
        <p className="text-sm text-slate-500">Notes</p>
        <p className="mt-2 text-sm leading-6 text-slate-700">
          {paymentRequest.description ?? paymentRequest.notes ?? '-'}
        </p>
      </div>
    </div>
  );
}

export function PaymentSummaryCard({
  paymentRequest,
  onPay,
  onCancel,
  isCancelPending,
  canShowPayAction,
  shouldHideActions,
  blockedMessage,
}: {
  paymentRequest: PaymentRequestDetail;
  onPay: () => void;
  onCancel: () => void;
  isCancelPending: boolean;
  canShowPayAction: boolean;
  shouldHideActions: boolean;
  blockedMessage: string;
}) {
  const total = paymentRequest.totalAmount || paymentRequest.amount;
  const paid = paymentRequest.paidAmount ?? Math.max(total - paymentRequest.remainingAmount, 0);
  const remaining = paymentRequest.remainingAmount ?? paymentRequest.amount;
  const percentage = total > 0 ? Math.round((paid / total) * 100) : 0;

  const canPay =
    !shouldHideActions &&
    canShowPayAction &&
    (paymentRequest.status === 'approved' ||
      paymentRequest.status === 'pending' ||
      paymentRequest.status === 'partial_paid');
  const canCancel =
    !shouldHideActions && paymentRequest.status !== 'cancelled' && paymentRequest.status !== 'paid';
  const shouldShowBlockedMessage = !shouldHideActions && !canShowPayAction && percentage < 100;
  const isWaitingProcess =
    shouldHideActions ||
    shouldShowBlockedMessage ||
    paymentRequest.status === 'approved' ||
    paymentRequest.status === 'processing';

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
      <h2 className="text-base font-semibold text-slate-900">{labels.PAYMENT_SUMMARY}</h2>
      <div className="mt-5 space-y-4">
        <div className="flex justify-between gap-4 text-sm">
          <span className="text-slate-500">{labels.TOTAL_AMOUNT}</span>
          <span className="font-semibold text-slate-900">{formatCurrency(total)}</span>
        </div>
        <div className="flex justify-between gap-4 text-sm">
          <span className="text-slate-500">{labels.PAID}</span>
          <span className="font-semibold text-slate-900">{formatCurrency(paid)}</span>
        </div>
        <div className="flex justify-between gap-4 text-sm">
          <span className="text-slate-500">{labels.REMAINING}</span>
          <span className="font-semibold text-slate-900">{formatCurrency(remaining)}</span>
        </div>
      </div>

      {isWaitingProcess ? (
        <div className="mt-5 flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{shouldHideActions ? labels.WAITING_APPROVAL_MSG : blockedMessage}</p>
        </div>
      ) : percentage < 100 ? (
        <div className="mt-5 flex items-center gap-3">
          <Progress value={percentage} className="h-2 flex-1 bg-slate-100 [&>div]:bg-amber-500" />
          <span className="text-sm font-medium text-slate-600">{percentage}%</span>
        </div>
      ) : null}

      <div className="mt-6 space-y-3 border-t border-slate-200 pt-5">
        {canPay && (
          <Button className="w-full bg-teal-600 hover:bg-teal-700" onClick={onPay}>
            {labels.PAY_NOW}
          </Button>
        )}
        {canCancel && (
          <Button
            variant="outline"
            className="w-full border-red-100 text-red-500 hover:bg-red-50 hover:text-red-600"
            disabled={isCancelPending}
            onClick={onCancel}
          >
            {labels.CANCEL_PAYMENT}
          </Button>
        )}
      </div>
    </div>
  );
}

function PayrollDetailModal({
  open,
  onClose,
  item,
  period,
}: {
  open: boolean;
  onClose: () => void;
  item: PaymentRequestSourceItem | null;
  period: string;
}) {
  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-[20px] p-0 sm:max-w-2xl">
        <DialogHeader className="px-8 pt-8 pb-0">
          <DialogTitle className="text-[20px] font-semibold text-slate-950">
            {labels.PAYROLL_DETAIL_TITLE}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 px-8 py-8">
          <div className="text-[15px] text-slate-600">
            <span>{labels.PAYROLL_DETAIL_PERIOD}: </span>
            <span className="font-semibold text-slate-950">{period}</span>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-100 text-lg text-slate-500">
              {getInitials(item?.employeeName)}
            </div>
            <div className="min-w-0">
              <p className="text-[20px] font-semibold leading-7 text-slate-950">
                {item?.employeeName ?? '-'}
              </p>
              <p className="text-[15px] text-slate-500">{item?.employeeCode ?? '-'}</p>
            </div>
          </div>

          <div className="space-y-5 text-[15px]">
            <div className="flex items-start justify-between gap-6">
              <span className="text-slate-600">{labels.PAYROLL_DETAIL_GRADE}</span>
              <span className="text-right font-semibold text-slate-950">
                {item?.employeeGrade ?? '-'}
              </span>
            </div>
            <div className="flex items-start justify-between gap-6">
              <span className="text-slate-600">{labels.PAYROLL_DETAIL_POSITION}</span>
              <span className="text-right font-semibold text-slate-950">
                {item?.employeePosition ?? '-'}
              </span>
            </div>
            <div className="flex items-start justify-between gap-6">
              <span className="text-slate-600">{labels.PAYROLL_DETAIL_ACCOUNT}</span>
              <span className="text-right font-semibold text-slate-950">
                {item ? getPayrollAccountLabel(item) : '-'}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[15px] font-semibold text-slate-950">
              {labels.PAYROLL_DETAIL_COMPONENTS_TITLE}
            </h3>
            <div className="space-y-5 text-[15px]">
              {(item?.itemsDetail ?? []).map((detail) => {
                const displayAmount = detail.signedAmount ?? detail.amount ?? 0;
                const amountClassName = displayAmount < 0 ? 'text-red-500' : 'text-slate-950';

                return (
                  <div key={detail.id} className="flex items-start justify-between gap-6">
                    <span className="text-slate-600">{detail.componentName ?? '-'}</span>
                    <span className={`text-right font-semibold ${amountClassName}`}>
                      {formatCurrency(displayAmount)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border-t border-slate-200 pt-5">
            <div className="flex items-start justify-between gap-6 text-[15px]">
              <span className="font-semibold text-slate-950">
                {labels.PAYROLL_DETAIL_NET_AMOUNT}
              </span>
              <span className="text-right text-[16px] font-semibold text-slate-950">
                {formatCurrency(item?.netAmount ?? item?.amount ?? 0)}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-[15px] font-semibold text-slate-950">
              {labels.PAYROLL_DETAIL_NOTE}
            </h3>
            <p className="text-[15px] text-slate-600">{item?.notes ?? '-'}</p>
          </div>
        </div>

        <DialogFooter className="border-t border-slate-200 bg-white px-8 pt-4 pb-8 sm:justify-end">
          <Button type="button" variant="outline" className="min-w-28 bg-white" onClick={onClose}>
            {COMMON_LABELS.ACTIONS.CANCEL}
          </Button>
          <Button type="button" className="min-w-32 bg-teal-600 hover:bg-teal-700">
            {labels.DOWNLOAD}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function SourceItemsCard({ paymentRequest }: { paymentRequest: PaymentRequestDetail }) {
  const items = paymentRequest.source.items;
  const [selectedPayrollItem, setSelectedPayrollItem] = useState<PaymentRequestSourceItem | null>(
    null
  );
  const [payrollDetailOpen, setPayrollDetailOpen] = useState(false);
  const isPayroll = paymentRequest.sourceType === 'payroll';
  const isCostRequest = paymentRequest.sourceType === 'cost_request';
  const periodRange = formatPeriodRange(
    paymentRequest.source.periodStart,
    paymentRequest.source.periodEnd
  );

  const columns = useMemo<ColumnDef<PaymentRequestSourceItem>[]>(() => {
    if (isPayroll) {
      return [
        {
          accessorKey: 'employeeName',
          header: labels.TABLE_PAYROLL_EMPLOYEE,
          cell: ({ row }) => (
            <div className="font-medium text-slate-900">{row.original.employeeName ?? '-'}</div>
          ),
        },
        {
          accessorKey: 'employeeGrade',
          header: labels.TABLE_PAYROLL_GRADE,
          cell: ({ row }) => row.original.employeeGrade ?? '-',
        },
        {
          accessorKey: 'bankAccountNumber',
          header: labels.TABLE_PAYROLL_ACCOUNT,
          cell: ({ row }) => (
            <span className="whitespace-nowrap">{getPayrollAccountLabel(row.original)}</span>
          ),
        },
        {
          accessorKey: 'netAmount',
          header: labels.TABLE_PAYROLL_NET_AMOUNT,
          cell: ({ row }) => (
            <span className="whitespace-nowrap">
              {formatCurrency(row.original.netAmount ?? row.original.amount)}
            </span>
          ),
        },
        {
          id: 'actions',
          header: labels.TABLE_ACTION,
          meta: {
            headerClassName: 'text-center [&>div]:justify-center',
            cellClassName: 'text-center',
          },
          cell: ({ row }) => (
            <div className="flex justify-center">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                aria-label={labels.ACTION_VIEW}
                onClick={() => {
                  setSelectedPayrollItem(row.original);
                  setPayrollDetailOpen(true);
                }}
              >
                <Eye className="h-4 w-4 text-slate-500" />
              </Button>
            </div>
          ),
        },
      ];
    }

    if (isCostRequest) {
      return [
        {
          accessorKey: 'receiptNumber',
          header: labels.TABLE_RECEIPT_NUMBER,
          cell: ({ row }) => row.original.receiptNumber ?? '-',
        },
        {
          accessorKey: 'amount',
          header: labels.TABLE_TOTAL_AMOUNT,
          cell: ({ row }) => formatCurrency(row.original.amount),
        },
        {
          accessorKey: 'description',
          header: labels.TABLE_DESCRIPTION,
          cell: ({ row }) => row.original.description ?? '-',
        },
      ];
    }

    return [
      {
        accessorKey: 'catalogName',
        header: labels.TABLE_CATALOG,
        cell: ({ row }) =>
          row.original.catalogName ?? row.original.receiptNumber ?? row.original.description ?? '-',
      },
      {
        accessorKey: 'quantity',
        header: labels.TABLE_QUANTITY,
        cell: ({ row }) => row.original.quantity ?? '-',
      },
      {
        accessorKey: 'unitPrice',
        header: labels.TABLE_UNIT_PRICE,
        cell: ({ row }) =>
          row.original.unitPrice != null ? formatCurrency(row.original.unitPrice) : '-',
      },
      {
        accessorKey: 'amount',
        header: labels.TABLE_TOTAL_AMOUNT,
        cell: ({ row }) => formatCurrency(row.original.amount),
      },
      {
        accessorKey: 'remarks',
        header: labels.TABLE_ITEM_NOTES,
        cell: ({ row }) => row.original.purchaseRequestItem?.remarks ?? row.original.notes ?? '-',
      },
    ];
  }, [isCostRequest, isPayroll]);

  return (
    <>
      <AccordionCard
        title={labels.SOURCE_ITEMS}
        headerContent={
          <>
            <Badge variant="secondary" className="rounded-full text-slate-600">
              {items.length} {labels.SOURCE_ITEMS_COUNT_SUFFIX}
            </Badge>
            {isPayroll && paymentRequest.source.periodTypeLabel && (
              <Badge variant="outline" className="rounded-full border-slate-200 text-slate-600">
                {paymentRequest.source.periodTypeLabel}
              </Badge>
            )}
            {isPayroll && (
              <Badge variant="outline" className="rounded-full border-slate-200 text-slate-600">
                {labels.SOURCE_ITEMS_PERIOD}: {periodRange}
              </Badge>
            )}
          </>
        }
      >
        <div className="space-y-4">
          {isPayroll && (
            <div className="flex justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button type="button" variant="outline" size="sm" className="gap-2">
                    <Download className="h-4 w-4" />
                    {labels.EXPORT}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>{labels.EXPORT_PDF}</DropdownMenuItem>
                  <DropdownMenuItem>{labels.EXPORT_EXCEL}</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          <DataTable
            columns={columns}
            data={items}
            enableZebraStripes={false}
            enablePagination={false}
            className="overflow-hidden rounded-lg border border-slate-200"
          />
        </div>
      </AccordionCard>

      <PayrollDetailModal
        open={payrollDetailOpen}
        onClose={() => setPayrollDetailOpen(false)}
        item={selectedPayrollItem}
        period={periodRange}
      />
    </>
  );
}

export function PaymentEventsCard({
  events,
  onOpenProof,
}: {
  events: PaymentRequestDetail['paymentRequestEvents'];
  onOpenProof: (document: PaymentRequestEventDocument) => void;
}) {
  const columns = useMemo<ColumnDef<PaymentRequestDetail['paymentRequestEvents'][number]>[]>(
    () => [
      {
        accessorKey: 'paidAt',
        header: 'Paid At',
        cell: ({ row }) => formatDateTime(row.original.paidAt),
      },
      { accessorKey: 'paymentMethodLabel', header: 'Method' },
      {
        accessorKey: 'amount',
        header: 'Amount',
        cell: ({ row }) => (
          <span className="font-medium text-slate-900">{formatCurrency(row.original.amount)}</span>
        ),
      },
      { accessorKey: 'paidByName', header: 'Paid By' },
      {
        accessorKey: 'checkNumber',
        header: 'Check Number',
        cell: ({ row }) => row.original.checkNumber ?? '-',
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <Badge variant="outline" className={eventStatusClassNames[row.original.status]}>
            {row.original.statusLabel}
          </Badge>
        ),
      },
      {
        id: 'actions',
        header: 'Action',
        cell: ({ row }) => {
          const event = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <EllipsisVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {event.canMarkCleared && (
                  <>
                    <DropdownMenuItem className="cursor-pointer font-medium text-emerald-600 focus:text-emerald-700">
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Mark Cleared
                    </DropdownMenuItem>
                    <div className="my-1 h-px bg-slate-100" />
                  </>
                )}
                {event.documents.length > 0 && (
                  <DropdownMenuItem
                    className="cursor-pointer font-medium text-blue-600 focus:text-blue-700"
                    onClick={() => onOpenProof(event.documents[0])}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    {labels.PROOF_PAYMENT}
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [onOpenProof]
  );

  return (
    <AccordionCard title={labels.HISTORY_PEMBAYARAN}>
      <DataTable
        columns={columns}
        data={events}
        enableZebraStripes={false}
        enablePagination={false}
        className="overflow-hidden rounded-lg border border-slate-200"
      />
    </AccordionCard>
  );
}
