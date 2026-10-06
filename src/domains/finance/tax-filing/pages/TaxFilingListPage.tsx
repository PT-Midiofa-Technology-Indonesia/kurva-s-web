'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { parse } from 'date-fns';
import { Eye } from 'lucide-react';
import { useMemo } from 'react';
import type { DateRange } from 'react-day-picker';
import { useQueryParams } from '@/hooks/use-query-params';
import { AsyncSelect } from '@/shared/components/atoms';
import { Alert, AlertTitle, DatePicker } from '@/shared/components/molecules';
import { ListPageTemplate } from '@/shared/components/templates/ListPageTemplate';
import { Badge, Button } from '@/shared/components/ui';
import { useCompanyFilter } from '@/shared/hooks/use-company-filter';
import type { BaseQueryParams } from '@/shared/types/query-params';
import { formatCurrencyIDR, formatDate } from '@/shared/utils/format';
import {
  TAX_FILING_LABELS,
  TAX_FILING_STATUS_LABELS,
  TAX_FILING_STATUS_OPTIONS,
} from '../constants';
import { useTaxFilingPage, useTaxTypes } from '../hooks';
import type { TaxFiling } from '../types';

interface TaxFilingUrlParams extends BaseQueryParams {
  status?: string;
  taxPeriod?: string;
  taxTypeId?: string;
  companyId?: string;
}
export function TaxFilingListPage() {
  const { queryParams, setQueryParams } = useQueryParams<TaxFilingUrlParams>();
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
      taxPeriod: queryParams.taxPeriod,
      taxTypeId: queryParams.taxTypeId,
      companyId,
    }),
    [queryParams, companyId]
  );
  const {
    taxFilings,
    totalItems,
    totalPages,
    isLoading,
    isError,
    handleViewDetail,
    handleSearchChange,
    handleStatusChange,
    handleTaxPeriodChange,
    handleTaxTypeChange,
    handleSort,
    handlePaginationChange,
  } = useTaxFilingPage({ params, onSetQueryParams: (updates) => setQueryParams(updates) });
  const taxTypeOptions = useMemo(
    () =>
      (taxTypesData?.data ?? []).map((taxType) => ({
        value: taxType.id,
        label: taxType.name,
      })),
    [taxTypesData]
  );

  const taxPeriodDate = useMemo(() => {
    if (!queryParams.taxPeriod) return null;
    try {
      return parse(queryParams.taxPeriod, 'yyyy-MM', new Date());
    } catch {
      return null;
    }
  }, [queryParams.taxPeriod]);

  const handleTaxPeriodDateChange = (date: Date | DateRange | undefined) => {
    if (date instanceof Date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      handleTaxPeriodChange(`${year}-${month}`);
    } else {
      handleTaxPeriodChange(undefined);
    }
  };
  const columns = useMemo<ColumnDef<TaxFiling>[]>(
    () => [
      {
        accessorKey: 'code',
        header: TAX_FILING_LABELS.LIST.COLUMNS.CODE,
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
        accessorKey: 'taxPeriod',
        header: TAX_FILING_LABELS.LIST.COLUMNS.TAX_PERIOD,
        enableSorting: true,
      },
      {
        accessorKey: 'taxTypename',
        header: TAX_FILING_LABELS.LIST.COLUMNS.TAX_TYPE,
        enableSorting: false,
        cell: ({ row }) => <span>{row.original.taxType.name}</span>,
      },
      {
        accessorKey: 'totalTax',
        header: TAX_FILING_LABELS.LIST.COLUMNS.TOTAL_TAX,
        enableSorting: true,
        cell: ({ row }) => <span>{formatCurrencyIDR(row.original.totalTax)}</span>,
      },
      {
        accessorKey: 'dueDate',
        header: TAX_FILING_LABELS.LIST.COLUMNS.DUE_DATE,
        enableSorting: true,
        cell: ({ row }) => <span>{formatDate(row.original.dueDate)}</span>,
      },
      {
        accessorKey: 'status',
        header: TAX_FILING_LABELS.LIST.COLUMNS.STATUS,
        enableSorting: true,
        cell: ({ row }) => (
          <Badge variant="secondary">
            {TAX_FILING_STATUS_LABELS[row.original.status] ?? row.original.status}
          </Badge>
        ),
      },
      {
        id: 'actions',
        header: TAX_FILING_LABELS.LIST.COLUMNS.ACTION,
        enableSorting: false,
        enableHiding: false,
        size: 60,
        cell: ({ row }) => (
          <div className="flex justify-center">
            <Button
              variant="ghost"
              className="h-6 w-6 p-0"
              aria-label={TAX_FILING_LABELS.LIST.ACTIONS.VIEW}
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
      <ListPageTemplate<TaxFiling>
        title={TAX_FILING_LABELS.LIST.TITLE}
        banner={
          <Alert variant="warning">
            <AlertTitle>
              Tax Filling akan di generate secara otomatis oleh sistem per periode per tax type!
            </AlertTitle>
          </Alert>
        }
        headerActions={
          <AsyncSelect
            className="w-52"
            options={companyOptions}
            value={companyId ?? null}
            onChange={handleCompanyChange}
            placeholder={TAX_FILING_LABELS.LIST.FILTERS.COMPANY}
            isSearchable={false}
            isClearable={false}
          />
        }
        data={taxFilings}
        columns={columns}
        isLoading={isLoading}
        isError={isError}
        emptyMessage={TAX_FILING_LABELS.LIST.EMPTY}
        search={queryParams.search}
        searchPlaceholder={TAX_FILING_LABELS.LIST.SEARCH_PLACEHOLDER}
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
              mode="month"
              value={taxPeriodDate}
              onChange={handleTaxPeriodDateChange}
              placeholder={TAX_FILING_LABELS.LIST.FILTERS.PERIOD}
              className="w-44"
            />
            <AsyncSelect
              className="w-40"
              options={taxTypeOptions}
              value={queryParams.taxTypeId ?? null}
              placeholder={TAX_FILING_LABELS.LIST.FILTERS.TAX_TYPE}
              isSearchable={false}
              isLoading={isTaxTypesLoading}
              onChange={(value) =>
                handleTaxTypeChange(typeof value === 'string' ? value : undefined)
              }
              isClearable
            />
            <AsyncSelect
              className="w-40"
              options={TAX_FILING_STATUS_OPTIONS}
              value={queryParams.status ?? null}
              placeholder={TAX_FILING_LABELS.LIST.FILTERS.STATUS}
              isSearchable={false}
              onChange={(value) =>
                handleStatusChange(typeof value === 'string' ? value : undefined)
              }
              isClearable
            />
          </div>
        }
      />
    </div>
  );
}
