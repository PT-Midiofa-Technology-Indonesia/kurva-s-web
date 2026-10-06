'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { AlertTriangle, Calendar as CalendarIcon, Clock, CreditCard, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import type { DateRange } from 'react-day-picker';
import { useQueryParams } from '@/hooks/use-query-params';
import { AsyncSelect } from '@/shared/components/atoms';
import { DatePicker, NoticeTooltip } from '@/shared/components/molecules';
import { ListPageTemplate } from '@/shared/components/templates/ListPageTemplate';
import { Badge, Button } from '@/shared/components/ui';
import { useCompanyFilter } from '@/shared/hooks/use-company-filter';
import { usePaymentRequestStatuses, usePaymentSourceTypes } from '@/shared/hooks/use-enums';
import type { BaseQueryParams } from '@/shared/types/query-params';
import { formatCurrencyIDR as formatCurrency } from '@/shared/utils/format';
import { PAYMENT_REQUEST_LABELS } from '../constants';
import { usePaymentRequestPage } from '../hooks/use-payment-request-page';
import type { PaymentRequest, PaymentRequestStatus, PaymentRequestSummary } from '../types';

interface PaymentRequestUrlParams extends BaseQueryParams {
  status?: string;
  sourceType?: string;
  companyId?: string;
  startDate?: string;
  endDate?: string;
}

function StatusBadge({ status, label }: { status: PaymentRequestStatus; label?: string }) {
  const classNames: Record<PaymentRequestStatus, string> = {
    pending: 'bg-amber-50 text-amber-600 border-amber-100',
    approved: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    processing: 'bg-blue-50 text-blue-600 border-blue-100',
    partial_paid: 'bg-amber-50 text-amber-600 border-amber-100',
    paid: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    cancelled: 'bg-red-50 text-red-600 border-red-100',
    rejected: 'bg-red-50 text-red-600 border-red-100',
  };

  return (
    <Badge variant="outline" className={classNames[status]}>
      {label ?? status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

function SummaryCard({
  title,
  item,
  tone,
  icon: Icon,
}: {
  title: string;
  item?: PaymentRequestSummary[keyof PaymentRequestSummary];
  tone: 'amber' | 'emerald' | 'red';
  icon: typeof Clock;
}) {
  const colors = {
    amber: { box: 'bg-amber-50 text-amber-500', text: 'text-amber-500' },
    emerald: { box: 'bg-emerald-50 text-emerald-500', text: 'text-emerald-500' },
    red: { box: 'bg-red-50 text-red-500', text: 'text-red-500' },
  }[tone];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
      <div className="flex items-start gap-4">
        <div className={`rounded-lg p-3 ${colors.box}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
          <p className={`mt-2 text-xl font-semibold ${colors.text}`}>
            {formatCurrency(item?.amount ?? 0)}
          </p>
          <p className="mt-1 text-sm text-slate-500">{item?.total ?? 0} Request</p>
        </div>
      </div>
    </div>
  );
}

export function PaymentRequestListPage() {
  const router = useRouter();
  const { queryParams, updateQueryParam, setQueryParams } =
    useQueryParams<PaymentRequestUrlParams>();

  const { companyId, companyOptions, handleCompanyChange } = useCompanyFilter();

  const { data: statusOptions = [] } = usePaymentRequestStatuses();
  const { data: sourceTypeOptions = [] } = usePaymentSourceTypes();

  const params = useMemo(
    () => ({
      page: queryParams.page ?? 1,
      perPage: queryParams.perPage ?? 10,
      sortBy: queryParams.sortBy,
      sortOrder: (queryParams.sortOrder || 'asc') as 'asc' | 'desc',
      search: queryParams.search,
      status: queryParams.status,
      sourceType: queryParams.sourceType,
      companyId,
      startDate: queryParams.startDate,
      endDate: queryParams.endDate,
    }),
    [queryParams, companyId]
  );

  const pageOptions = useMemo(
    () => ({
      params,
      onUpdateQueryParam: updateQueryParam,
      onSetQueryParams: setQueryParams,
    }),
    [params, updateQueryParam, setQueryParams]
  );

  const {
    paymentRequests,
    summary,
    totalItems,
    totalPages,
    isLoading,
    isError,
    handleViewDetail,
    handleStatusChange,
    handleSourceTypeChange,
    handleSearchChange,
    handleSort,
    handlePaginationChange,
  } = usePaymentRequestPage(pageOptions);

  const dateRangeValue = useMemo(() => {
    if (!queryParams.startDate && !queryParams.endDate) return undefined;
    return {
      from: queryParams.startDate ? new Date(queryParams.startDate) : undefined,
      to: queryParams.endDate ? new Date(queryParams.endDate) : undefined,
    };
  }, [queryParams.startDate, queryParams.endDate]);

  const handleDateRangeChange = useCallback(
    (value: Date | DateRange | undefined) => {
      const range = value && 'from' in value ? (value as DateRange) : undefined;
      if (!range || (!range.from && !range.to)) {
        setQueryParams({ startDate: undefined, endDate: undefined, page: 1 } as any);
        return;
      }
      if (!range.from || !range.to) return;
      setQueryParams({
        startDate: format(range.from, 'yyyy-MM-dd'),
        endDate: format(range.to, 'yyyy-MM-dd'),
        page: 1,
      } as any);
    },
    [setQueryParams]
  );

  const columns = useMemo<ColumnDef<PaymentRequest>[]>(
    () => [
      {
        accessorKey: 'code',
        header: PAYMENT_REQUEST_LABELS.LIST.COLUMNS.CODE,
        enableSorting: true,
        cell: ({ row }) => (
          <span className="text-sm font-medium text-slate-700 hover:text-primary hover:underline hover:underline-offset-2">
            {row.original.code}
          </span>
        ),
      },
      {
        accessorKey: 'sourceTypeLabel',
        header: PAYMENT_REQUEST_LABELS.LIST.COLUMNS.SOURCE_TYPE,
        enableSorting: true,
        cell: ({ row }) => (
          <span className="text-sm text-slate-700">{row.original.sourceTypeLabel}</span>
        ),
      },
      {
        accessorKey: 'amount',
        header: PAYMENT_REQUEST_LABELS.LIST.COLUMNS.AMOUNT,
        enableSorting: true,
        cell: ({ row }) => (
          <span className="text-sm font-medium text-slate-900">
            {formatCurrency(row.original.amount)}
          </span>
        ),
      },
      {
        accessorKey: 'dueDate',
        header: PAYMENT_REQUEST_LABELS.LIST.COLUMNS.DUE_DATE,
        enableSorting: true,
        cell: ({ row }) => {
          const className = row.original.isOverdue ? 'text-red-500' : 'text-slate-700';
          const dueDate = new Date(row.original.dueDate).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          });
          const content = (
            <span className={`inline-flex items-center gap-1 text-sm ${className}`}>
              {row.original.isOverdue && <AlertTriangle className="h-4 w-4" />}
              {dueDate}
            </span>
          );

          if (!row.original.isOverdue) return content;

          return (
            <NoticeTooltip
              title="Segera Lakukan pembayaran"
              description="Pembayaran ini telah jatuh tempo. Segera lakukan pembayaran atau ubah tanggal jatuh tempo melalui menu Edit Due Date."
            >
              {content}
            </NoticeTooltip>
          );
        },
      },
      {
        accessorKey: 'status',
        header: PAYMENT_REQUEST_LABELS.LIST.COLUMNS.STATUS,
        enableSorting: true,
        cell: ({ row }) => (
          <StatusBadge status={row.original.status} label={row.original.statusLabel} />
        ),
      },
      {
        id: 'actions',
        header: PAYMENT_REQUEST_LABELS.LIST.COLUMNS.ACTIONS,
        enableSorting: false,
        enableHiding: false,
        size: 60,
        cell: ({ row }) => (
          <div className="flex justify-start">
            <Button
              variant="ghost"
              className="h-8 w-8 p-0"
              onClick={() => handleViewDetail(row.original.id)}
            >
              <Eye className="h-4 w-4 text-slate-600" />
            </Button>
          </div>
        ),
      },
    ],
    [handleViewDetail]
  );

  return (
    <div className="flex h-full flex-col">
      <div className="grid grid-cols-1 gap-4 px-6 pt-6 md:grid-cols-3">
        <SummaryCard title="Pending Payment" item={summary?.pending} tone="amber" icon={Clock} />
        <SummaryCard title="Paid" item={summary?.paid} tone="emerald" icon={CreditCard} />
        <SummaryCard title="Overdue" item={summary?.overdue} tone="red" icon={AlertTriangle} />
      </div>
      <ListPageTemplate<PaymentRequest>
        title={PAYMENT_REQUEST_LABELS.LIST.TITLE}
        headerActions={
          <AsyncSelect
            className="w-52"
            options={companyOptions}
            value={companyId ?? null}
            onChange={handleCompanyChange}
            placeholder={PAYMENT_REQUEST_LABELS.LIST.FILTERS.COMPANY}
            isSearchable={false}
            isClearable={false}
          />
        }
        data={paymentRequests}
        columns={columns}
        isLoading={isLoading}
        isError={isError}
        emptyMessage={PAYMENT_REQUEST_LABELS.LIST.EMPTY}
        search={queryParams.search}
        searchPlaceholder={PAYMENT_REQUEST_LABELS.LIST.SEARCH_PLACEHOLDER}
        onSearchChange={handleSearchChange}
        sortBy={params.sortBy}
        sortOrder={params.sortOrder}
        onSort={handleSort}
        page={params.page}
        perPage={params.perPage}
        totalItems={totalItems}
        totalPages={totalPages}
        onPaginationChange={handlePaginationChange}
        toolbarRight={
          <div className="flex items-center gap-2">
            <DatePicker
              mode="range"
              value={dateRangeValue}
              onChange={handleDateRangeChange}
              rangePlaceholder="Date Range"
              className="w-44"
            />
            <AsyncSelect
              className="w-36"
              options={sourceTypeOptions}
              value={queryParams.sourceType ?? null}
              placeholder="Type"
              isSearchable={false}
              onChange={handleSourceTypeChange}
              isClearable
            />
            <AsyncSelect
              className="w-36"
              options={statusOptions}
              value={queryParams.status ?? null}
              placeholder="Status"
              isSearchable={false}
              onChange={handleStatusChange}
              isClearable
            />
            <Button
              size="sm"
              className="h-9 gap-2 bg-teal-600 px-3 text-white hover:bg-teal-700"
              onClick={() =>
                router.push(`/finance/payment-requests/schedule?companyId=${companyId ?? ''}`)
              }
              title="Payment Calendar"
            >
              <CalendarIcon className="h-4 w-4" />
              View Calendar
            </Button>
          </div>
        }
      />
    </div>
  );
}
