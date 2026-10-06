'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import type { DateRange } from 'react-day-picker';
import { AsyncSelect, type SelectValue } from '@/shared/components/atoms';
import { DatePicker } from '@/shared/components/molecules/DatePicker/DatePicker';
import { ListPageTemplate } from '@/shared/components/templates/ListPageTemplate';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { useCompanyFilter } from '@/shared/hooks/use-company-filter';
import { useFinanceReportTypes, useTaxResourceTypes } from '@/shared/hooks/use-enums';
import { useQueryParams } from '@/shared/hooks/use-query-params';
import { formatIDR } from '@/shared/utils/currency';
import type { BaseQueryParams } from '@/types/query-params';
import { FINANCE_REPORT_LABELS, FINANCE_REPORT_TYPE_BADGE } from '../constants';
import { useFinanceReportListPage } from '../hooks/use-finance-report-list-page';
import type { FinanceReportItem, FinanceReportType } from '../types';

interface FinanceReportUrlParams extends BaseQueryParams {
  companyId?: string;
  source?: string;
  dateFrom?: string;
  dateTo?: string;
  type?: string;
}

function toDate(value?: string) {
  return value ? new Date(`${value}T00:00:00`) : undefined;
}

function toDateRange(dateFrom?: string, dateTo?: string): DateRange | undefined {
  if (!dateFrom && !dateTo) return undefined;
  return { from: toDate(dateFrom), to: toDate(dateTo) };
}

function SummaryCard({
  title,
  value,
  description,
  tone = 'default',
}: {
  title: string;
  value: number;
  description: string;
  tone?: 'default' | 'danger';
}) {
  const valueClass = tone === 'danger' ? 'text-destructive' : 'text-primary';
  const formattedValue =
    title === FINANCE_REPORT_LABELS.LIST.SUMMARY.NET_BALANCE
      ? `${value >= 0 ? '+ ' : '- '}${formatIDR(Math.abs(value))}`
      : formatIDR(value);

  return (
    <Card className="shadow-xs">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-slate-500">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-semibold ${valueClass}`}>{formattedValue}</div>
        <p className="mt-2 text-sm text-slate-500">{description}</p>
      </CardContent>
    </Card>
  );
}

export function FinanceReportListPage() {
  const router = useRouter();
  const { queryParams, setQueryParams } = useQueryParams<FinanceReportUrlParams>();
  const { companyId, companyOptions, handleCompanyChange } = useCompanyFilter();
  const { data: sourceTypeOptions = [] } = useTaxResourceTypes();
  const { data: financeReportTypeOptions = [] } = useFinanceReportTypes();

  const params = useMemo(
    () => ({
      companyId,
      page: queryParams.page ?? 1,
      perPage: queryParams.perPage ?? 10,
      sortBy: queryParams.sortBy,
      sortOrder: (queryParams.sortOrder || 'desc') as 'asc' | 'desc',
      search: queryParams.search,
      source: queryParams.source,
      dateFrom: queryParams.dateFrom,
      dateTo: queryParams.dateTo,
      type: queryParams.type as FinanceReportType | undefined,
    }),
    [companyId, queryParams]
  );

  const {
    summary,
    items,
    totalItems,
    totalPages,
    isLoading,
    isError,
    handleSearchChange,
    handleSort,
    handlePaginationChange,
  } = useFinanceReportListPage({ params, onSetQueryParams: setQueryParams });

  const handleSourceChange = useCallback(
    (value: SelectValue) => {
      const val = Array.isArray(value) ? value[0] : value;
      setQueryParams({ source: (val as string) || undefined, page: 1 });
    },
    [setQueryParams]
  );

  const handleTypeChange = useCallback(
    (value: SelectValue) => {
      const val = Array.isArray(value) ? value[0] : value;
      setQueryParams({ type: (val as string) || undefined, page: 1 });
    },
    [setQueryParams]
  );

  const handleDateRangeChange = useCallback(
    (value: Date | DateRange | undefined) => {
      const range = value as DateRange | undefined;
      setQueryParams({
        dateFrom: range?.from ? format(range.from, 'yyyy-MM-dd') : undefined,
        dateTo: range?.to ? format(range.to, 'yyyy-MM-dd') : undefined,
        page: 1,
      });
    },
    [setQueryParams]
  );

  const columns = useMemo<ColumnDef<FinanceReportItem>[]>(
    () => [
      { accessorKey: 'code', header: 'Code' },
      { accessorKey: 'sourceLabel', header: 'Source' },
      {
        accessorKey: 'reference',
        header: 'Reference',
        cell: ({ row }) => row.original.reference ?? '-',
      },
      {
        accessorKey: 'amount',
        header: 'Amount',
        cell: ({ row }) => formatIDR(row.original.amount),
      },
      {
        accessorKey: 'transactionDate',
        header: 'Transaction Date',
        cell: ({ row }) => format(new Date(row.original.transactionDate), 'dd MMM yyyy HH:mm'),
      },
      {
        accessorKey: 'typeLabel',
        header: 'Type',
        cell: ({ row }) => (
          <Badge variant={FINANCE_REPORT_TYPE_BADGE[row.original.type]?.variant ?? 'secondary'}>
            {row.original.typeLabel}
          </Badge>
        ),
      },
      {
        accessorKey: 'actions',
        header: 'Action',
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push(`/finance/finance-report/${row.original.id}`)}
              title="Detail"
            >
              <Eye className="w-4 h-4 text-slate-500" />
            </Button>
          </div>
        ),
      },
    ],
    [router]
  );

  const headerActions = (
    <AsyncSelect
      className="w-44"
      options={companyOptions}
      value={companyId ?? null}
      onChange={handleCompanyChange}
      placeholder={FINANCE_REPORT_LABELS.LIST.FILTERS.COMPANY}
      isSearchable
    />
  );

  const toolbarRight = (
    <div className="flex items-center gap-2">
      <AsyncSelect
        className="w-44"
        options={sourceTypeOptions}
        value={queryParams.source ?? null}
        onChange={handleSourceChange}
        placeholder={FINANCE_REPORT_LABELS.LIST.FILTERS.SOURCE_TYPE}
        isSearchable={false}
        isClearable
      />
      <DatePicker
        mode="range"
        className="w-64"
        value={toDateRange(queryParams.dateFrom, queryParams.dateTo)}
        onChange={handleDateRangeChange}
        rangePlaceholder={FINANCE_REPORT_LABELS.LIST.FILTERS.DATE_RANGE}
      />
      <AsyncSelect
        className="w-36"
        options={financeReportTypeOptions}
        value={queryParams.type ?? null}
        onChange={handleTypeChange}
        placeholder={FINANCE_REPORT_LABELS.LIST.FILTERS.TYPE}
        isSearchable={false}
        isClearable
      />
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between px-6 pt-6">
        <h1 className="text-lg font-semibold text-slate-950">{FINANCE_REPORT_LABELS.LIST.TITLE}</h1>
        {headerActions}
      </div>
      <div className="grid grid-cols-1 gap-4 px-6 md:grid-cols-3">
        <SummaryCard
          title={FINANCE_REPORT_LABELS.LIST.SUMMARY.TOTAL_CASH_IN}
          value={summary.totalCashIn}
          description={`${items.filter((item) => item.type === 'cash_in').length} ${FINANCE_REPORT_LABELS.LIST.SUMMARY.CASH_IN_TRANSACTION}`}
        />
        <SummaryCard
          title={FINANCE_REPORT_LABELS.LIST.SUMMARY.TOTAL_CASH_OUT}
          value={summary.totalCashOut}
          description={`${items.filter((item) => item.type === 'cash_out').length} ${FINANCE_REPORT_LABELS.LIST.SUMMARY.CASH_OUT_TRANSACTION}`}
          tone="danger"
        />
        <SummaryCard
          title={FINANCE_REPORT_LABELS.LIST.SUMMARY.NET_BALANCE}
          value={summary.netBalance}
          description={FINANCE_REPORT_LABELS.LIST.SUMMARY.BALANCE_DESCRIPTION}
          tone={summary.netBalance < 0 ? 'danger' : 'default'}
        />
      </div>
      <ListPageTemplate<FinanceReportItem>
        title=""
        search={queryParams.search}
        searchPlaceholder={FINANCE_REPORT_LABELS.LIST.SEARCH}
        onSearchChange={handleSearchChange}
        toolbarRight={toolbarRight}
        data={items}
        columns={columns}
        isLoading={isLoading}
        isError={isError}
        emptyMessage="No finance report found."
        sortBy={params.sortBy}
        sortOrder={params.sortOrder}
        onSort={handleSort}
        page={params.page}
        perPage={params.perPage}
        totalItems={totalItems}
        totalPages={totalPages}
        onPaginationChange={handlePaginationChange}
        pageSizeOptions={[10, 25, 50, 100]}
      />
    </div>
  );
}
