'use client';

import { type ColumnDef } from '@tanstack/react-table';
import { Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo } from 'react';
import { useQueryParams } from '@/hooks/use-query-params';
import { AsyncSelect, type SelectValue } from '@/shared/components/atoms';
import { ListPageTemplate } from '@/shared/components/templates';
import { Button } from '@/shared/components/ui';
import { useCompanyFilter } from '@/shared/hooks/use-company-filter';
import { useBillingStatuses, useBillingTypes } from '@/shared/hooks/use-enums';
import type { BaseQueryParams } from '@/shared/types/query-params';
import { formatCurrencyIDR as formatCurrency } from '@/shared/utils/format';
import { BILLING_LABELS } from '../constants';
import { useBillingPage } from '../hooks';
import { BillingListFilters } from '../sections';
import type { BillingProjectListItem } from '../types';

interface BillingUrlParams extends BaseQueryParams {
  search?: string;
  type?: string;
  status?: string;
  companyId?: string;
}

export function BillingListPage() {
  const router = useRouter();
  const { queryParams, setQueryParams, resetQueryParam } = useQueryParams<BillingUrlParams>();
  const { companyId, companyOptions, handleCompanyChange } = useCompanyFilter();
  const { data: billingTypeOptions = [] } = useBillingTypes();
  const { data: billingStatusOptions = [] } = useBillingStatuses();

  useEffect(() => {
    if (!('dateFrom' in queryParams) && !('dateTo' in queryParams)) return;
    resetQueryParam('dateFrom' as keyof BillingUrlParams, 'dateTo' as keyof BillingUrlParams);
  }, [queryParams, resetQueryParam]);

  const { billings, totalItems, totalPages, isLoading, isError } = useBillingPage({
    params: {
      page: Number(queryParams.page ?? 1),
      perPage: Number(queryParams.perPage ?? 10),
      search: queryParams.search,
      billingType: queryParams.type,
      status: queryParams.status,
      companyId: companyId || undefined,
    },
  });

  const handleSearchChange = useCallback(
    (search: string | undefined) => {
      setQueryParams({ search, page: 1 });
    },
    [setQueryParams]
  );

  const handleBillingTypeChange = useCallback(
    (val: SelectValue) => {
      const type = val as string | undefined;
      setQueryParams({ type: type === 'all' ? undefined : type, page: 1 });
    },
    [setQueryParams]
  );

  const handleStatusChange = useCallback(
    (val: SelectValue) => {
      const status = val as string | undefined;
      setQueryParams({ status: status === 'all' ? undefined : status, page: 1 });
    },
    [setQueryParams]
  );

  const handlePaginationChange = useCallback(
    (page: number, perPage: number) => {
      setQueryParams({ page, perPage });
    },
    [setQueryParams]
  );

  const handleViewDetail = useCallback(
    (projectId: string) => {
      router.push(`/finance/billings/${projectId}${companyId ? `?companyId=${companyId}` : ''}`);
    },
    [router, companyId]
  );

  const handleCalendarClick = useCallback(() => {
    router.push(`/finance/billings/schedule${companyId ? `?companyId=${companyId}` : ''}`);
  }, [router, companyId]);

  const columns = useMemo<ColumnDef<BillingProjectListItem>[]>(
    () => [
      {
        id: 'proyek',
        header: 'Proyek',
        enableSorting: true,
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="text-sm font-medium text-slate-900">{row.original.code}</span>
            <span className="text-xs text-slate-500 line-clamp-1">{row.original.name}</span>
          </div>
        ),
      },
      {
        accessorKey: 'clientname',
        header: 'Client',
        enableSorting: false,
        cell: ({ row }) => <span className="text-sm">{row.original.client?.name ?? '-'}</span>,
      },
      {
        accessorKey: 'projectTypename',
        header: 'Type',
        enableSorting: false,
        cell: ({ row }) => <span className="text-sm">{row.original.projectType?.name ?? '-'}</span>,
      },
      {
        accessorKey: 'billinginitialProgressPercentage',
        header: 'Progress',
        enableSorting: false,
        cell: ({ row }) => (
          <span className="text-sm">{row.original.billing?.initialProgressPercentage ?? 0}%</span>
        ),
      },
      {
        accessorKey: 'billingprogressPercentage',
        header: 'Billed',
        enableSorting: false,
        cell: ({ row }) => (
          <span className="text-sm">{row.original.billing?.progressPercentage ?? 0}%</span>
        ),
      },
      {
        accessorKey: 'billingcontractValue',
        header: 'Contract Value',
        enableSorting: true,
        cell: ({ row }) => (
          <span className="text-sm font-medium">
            {formatCurrency(row.original.billing?.contractValue ?? 0)}
          </span>
        ),
      },
      {
        accessorKey: 'billingoutstanding',
        header: 'Outstanding',
        enableSorting: true,
        cell: ({ row }) => (
          <span className="text-sm font-medium">
            {formatCurrency(row.original.billing?.outstanding ?? 0)}
          </span>
        ),
      },
      {
        accessorKey: 'billingstatusLabel',
        header: 'Status',
        enableSorting: false,
        cell: ({ row }) => {
          const hasActiveBilling = row.original.billing.status === 'has_billing';

          return (
            <span
              className={
                hasActiveBilling
                  ? 'inline-flex items-center rounded-full bg-orange-500 px-3 py-1 text-xs font-semibold text-white'
                  : 'inline-flex items-center rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white'
              }
            >
              {row.original.billing.statusLabel}
            </span>
          );
        },
      },
      {
        id: 'actions',
        header: 'Action',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-400 hover:text-slate-600"
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
    <ListPageTemplate
      title="Billing Client"
      headerActions={
        <AsyncSelect
          className="w-52"
          options={companyOptions}
          value={companyId ?? null}
          onChange={handleCompanyChange}
          placeholder={BILLING_LABELS.LIST.FILTERS.COMPANY}
          isSearchable={false}
          isClearable={false}
        />
      }
      data={billings ?? []}
      columns={columns}
      isLoading={isLoading}
      isError={isError}
      emptyMessage={BILLING_LABELS.LIST.EMPTY_PROJECTS}
      search={queryParams.search}
      searchPlaceholder="Pencarian..."
      onSearchChange={handleSearchChange}
      page={Number(queryParams.page ?? 1)}
      perPage={Number(queryParams.perPage ?? 10)}
      totalItems={totalItems ?? 0}
      totalPages={totalPages ?? 1}
      onPaginationChange={handlePaginationChange}
      toolbarRight={
        <BillingListFilters
          billingTypeOptions={billingTypeOptions}
          billingStatusOptions={billingStatusOptions}
          onBillingTypeChange={handleBillingTypeChange}
          onStatusChange={handleStatusChange}
          onViewCalendar={handleCalendarClick}
        />
      }
    />
  );
}
