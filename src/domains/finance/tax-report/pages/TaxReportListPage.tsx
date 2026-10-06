'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Eye } from 'lucide-react';
import { useMemo } from 'react';
import type { DateRange } from 'react-day-picker';
import { useQueryParams } from '@/hooks/use-query-params';
import { AsyncSelect } from '@/shared/components/atoms';
import { DatePicker } from '@/shared/components/molecules';
import { ListPageTemplate } from '@/shared/components/templates/ListPageTemplate';
import { Badge, Button } from '@/shared/components/ui';
import { useCompanyFilter } from '@/shared/hooks/use-company-filter';
import type { BaseQueryParams } from '@/shared/types/query-params';
import { formatCurrencyIDR, formatDate } from '@/shared/utils/format';
import { TaxReportStatusBadge } from '../components/TaxReportCards';
import {
  TAX_REPORT_LABELS,
  TAX_REPORT_SOURCE_LABELS,
  TAX_REPORT_SOURCE_OPTIONS,
  TAX_REPORT_STATUS_OPTIONS,
} from '../constants';
import { useTaxReportPage } from '../hooks/use-tax-report-page';
import { useTaxTypes } from '../hooks/use-tax-reports';
import type { TaxReport } from '../types';

interface TaxReportUrlParams extends BaseQueryParams {
  status?: string;
  source?: string;
  taxTypeId?: string;
  companyId?: string;
  startDate?: string;
  endDate?: string;
}

export function TaxReportListPage() {
  const { queryParams, updateQueryParam, setQueryParams } = useQueryParams<TaxReportUrlParams>();
  const { companyId, companyOptions, handleCompanyChange } = useCompanyFilter();
  const { data: taxTypesData, isLoading: isTaxTypesLoading } = useTaxTypes();

  const params = useMemo(
    () => ({
      page: queryParams.page ?? 1,
      perPage: queryParams.perPage ?? 10,
      sortBy: queryParams.sortBy,
      sortOrder: (queryParams.sortOrder || 'asc') as 'asc' | 'desc',
      search: queryParams.search,
      status: queryParams.status,
      source: queryParams.source,
      taxTypeId: queryParams.taxTypeId,
      companyId,
      startDate: queryParams.startDate,
      endDate: queryParams.endDate,
    }),
    [queryParams, companyId]
  );

  const {
    taxReports,
    totalItems,
    totalPages,
    isLoading,
    isError,
    handleViewDetail,
    handleSearchChange,
    handleSourceChange,
    handleTaxTypeChange,
    handleStatusChange,
    handleSort,
    handlePaginationChange,
  } = useTaxReportPage({
    params,
    onUpdateQueryParam: updateQueryParam,
    onSetQueryParams: setQueryParams,
  });

  const dateRangeValue = useMemo(() => {
    if (!queryParams.startDate && !queryParams.endDate) return undefined;
    return {
      from: queryParams.startDate ? new Date(queryParams.startDate) : undefined,
      to: queryParams.endDate ? new Date(queryParams.endDate) : undefined,
    };
  }, [queryParams.startDate, queryParams.endDate]);

  const taxTypeOptions = useMemo(
    () =>
      (taxTypesData?.data ?? []).map((taxType) => ({
        value: taxType.id,
        label: taxType.name,
      })),
    [taxTypesData]
  );

  const handleDateRangeChange = (value: Date | DateRange | undefined) => {
    const range = value && 'from' in value ? value : undefined;
    if (!range || (!range.from && !range.to)) {
      setQueryParams({ startDate: undefined, endDate: undefined, page: 1 });
      return;
    }
    if (!range.from || !range.to) return;
    setQueryParams({
      startDate: format(range.from, 'yyyy-MM-dd'),
      endDate: format(range.to, 'yyyy-MM-dd'),
      page: 1,
    });
  };

  const columns = useMemo<ColumnDef<TaxReport>[]>(
    () => [
      {
        accessorKey: 'code',
        header: TAX_REPORT_LABELS.LIST.COLUMNS.CODE,
        enableSorting: true,
        cell: ({ row }) => (
          <button
            type="button"
            className="text-sm text-brand-500 underline"
            onClick={() => handleViewDetail(row.original.id)}
          >
            {row.original.code}
          </button>
        ),
      },
      {
        accessorKey: 'documentNumber',
        header: TAX_REPORT_LABELS.LIST.COLUMNS.DOCUMENT_NO,
        enableSorting: true,
        cell: ({ row }) => <span className="text-sm">{row.original.documentNumber ?? '-'}</span>,
      },
      {
        accessorKey: 'documentDate',
        header: TAX_REPORT_LABELS.LIST.COLUMNS.DOCUMENT_DATE,
        enableSorting: true,
        cell: ({ row }) => (
          <span className="text-sm">
            {row.original.documentDate ? formatDate(row.original.documentDate) : '-'}
          </span>
        ),
      },
      {
        accessorKey: 'resourceType',
        header: TAX_REPORT_LABELS.LIST.COLUMNS.SOURCE,
        enableSorting: true,
        cell: ({ row }) => (
          <Badge variant="secondary">
            {TAX_REPORT_SOURCE_LABELS[row.original.resourceType] ?? row.original.resourceType}
          </Badge>
        ),
      },
      {
        accessorKey: 'partnername',
        header: TAX_REPORT_LABELS.LIST.COLUMNS.PARTNER,
        enableSorting: false,
        cell: ({ row }) => <span className="text-sm">{row.original.partner?.name ?? '-'}</span>,
      },
      {
        accessorKey: 'totalAmount',
        header: TAX_REPORT_LABELS.LIST.COLUMNS.TOTAL_AMOUNT,
        enableSorting: true,
        cell: ({ row }) => (
          <span className="text-sm font-medium">{formatCurrencyIDR(row.original.totalAmount)}</span>
        ),
      },
      {
        accessorKey: 'status',
        header: TAX_REPORT_LABELS.LIST.COLUMNS.TAX_STATUS,
        enableSorting: true,
        cell: ({ row }) => <TaxReportStatusBadge status={row.original.status} />,
      },
      {
        id: 'actions',
        header: TAX_REPORT_LABELS.LIST.COLUMNS.ACTION,
        enableSorting: false,
        enableHiding: false,
        size: 60,
        cell: ({ row }) => (
          <div className="flex justify-center">
            <Button
              variant="ghost"
              className="h-6 w-6 p-0"
              aria-label={TAX_REPORT_LABELS.LIST.ACTIONS.VIEW}
              onClick={() => handleViewDetail(row.original.id)}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [handleViewDetail]
  );

  return (
    <div className="flex h-full flex-col">
      <ListPageTemplate<TaxReport>
        title={TAX_REPORT_LABELS.LIST.TITLE}
        headerActions={
          <AsyncSelect
            className="w-52"
            options={companyOptions}
            value={companyId ?? null}
            onChange={handleCompanyChange}
            placeholder={TAX_REPORT_LABELS.LIST.FILTERS.COMPANY}
            isSearchable={false}
            isClearable={false}
          />
        }
        data={taxReports}
        columns={columns}
        isLoading={isLoading}
        isError={isError}
        emptyMessage={TAX_REPORT_LABELS.LIST.EMPTY}
        search={queryParams.search}
        searchPlaceholder={TAX_REPORT_LABELS.LIST.SEARCH_PLACEHOLDER}
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
              rangePlaceholder={TAX_REPORT_LABELS.LIST.FILTERS.DATE_RANGE}
              className="w-44"
            />
            <AsyncSelect
              className="w-40"
              options={TAX_REPORT_SOURCE_OPTIONS}
              value={queryParams.source ?? null}
              placeholder={TAX_REPORT_LABELS.LIST.FILTERS.SOURCE}
              isSearchable={false}
              onChange={handleSourceChange}
              isClearable
            />
            <AsyncSelect
              className="w-40"
              options={taxTypeOptions}
              value={queryParams.taxTypeId ?? null}
              placeholder={TAX_REPORT_LABELS.LIST.FILTERS.TAX_TYPE}
              isSearchable={false}
              isLoading={isTaxTypesLoading}
              onChange={handleTaxTypeChange}
              isClearable
            />
            <AsyncSelect
              className="w-40"
              options={TAX_REPORT_STATUS_OPTIONS}
              value={queryParams.status ?? null}
              placeholder={TAX_REPORT_LABELS.LIST.FILTERS.STATUS}
              isSearchable={false}
              onChange={handleStatusChange}
              isClearable
            />
          </div>
        }
      />
    </div>
  );
}
