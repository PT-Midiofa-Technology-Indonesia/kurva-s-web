'use client';

import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Plus } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import type { DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';
import { AsyncSelect, Button } from '@/shared/components/atoms';
import { Alert, AlertDescription, AlertTitle, DatePicker } from '@/shared/components/molecules';
import { DataTableLayout } from '@/shared/components/templates/DataTableLayout';
import { PageTableTemplate } from '@/shared/components/templates/PageTableTemplate';
import { Badge } from '@/shared/components/ui/badge';
import { useCompanyFilter } from '@/shared/hooks/use-company-filter';
import { useQueryParams } from '@/shared/hooks/use-query-params';
import { formatCurrencyIDR, formatDate, parseDateString } from '@/shared/utils/format';
import type { GetPayrollDraftsParams, PayrollDraftSortField } from '../api/get-payroll-drafts';
import { CreateDraftModal } from '../components/CreateDraftModal';
import {
  PAYROLL_DRAFT_LABELS,
  PAYROLL_DRAFT_STATUS_BADGE,
  PAYROLL_DRAFT_STATUS_BADGE_FALLBACK_CLASS,
  PERIOD_TYPE_OPTIONS,
  STATUS_OPTIONS,
} from '../constants';
import { usePayrollDraftPage } from '../hooks/use-payroll-draft-page';
import type {
  PayrollDraftStatus,
  PayrollDraftSummary,
  PayrollDraftUrlParams,
  PeriodeType,
} from '../types';

// ── Inline Badge Components ──────────────────────────────────────────────

function StatusBadge({ status }: { status: PayrollDraftStatus }) {
  const config = PAYROLL_DRAFT_STATUS_BADGE[status];
  return (
    <Badge
      variant="outline"
      className={cn(
        'rounded-md border-0 font-medium',
        config?.className ?? PAYROLL_DRAFT_STATUS_BADGE_FALLBACK_CLASS
      )}
    >
      {config?.label ?? status}
    </Badge>
  );
}

function PeriodeTypeBadge({ type }: { type: PeriodeType }) {
  const label = PERIOD_TYPE_OPTIONS.find((option) => option.value === type)?.label ?? type;
  return <Badge variant="outline">{label}</Badge>;
}

const PAYROLL_DRAFT_SORT_FIELDS = new Set<PayrollDraftSortField>([
  'code',
  'periodType',
  'periodStart',
  'periodEnd',
  'status',
  'totalAmount',
  'createdAt',
]);

function isPayrollDraftSortField(value: string | undefined): value is PayrollDraftSortField {
  return value !== undefined && PAYROLL_DRAFT_SORT_FIELDS.has(value as PayrollDraftSortField);
}

export function PayrollDraftTab() {
  const { queryParams, updateQueryParam, setQueryParams } = useQueryParams<PayrollDraftUrlParams>();

  const { companyId, companyOptions, handleCompanyChange } = useCompanyFilter();
  const [modalOpen, setModalOpen] = useState(false);

  const dateRange = useMemo<DateRange | undefined>(() => {
    const from = queryParams.periodStart ? parseDateString(queryParams.periodStart) : undefined;
    const to = queryParams.periodEnd ? parseDateString(queryParams.periodEnd) : undefined;
    return from || to ? { from, to } : undefined;
  }, [queryParams.periodStart, queryParams.periodEnd]);

  // ── Page Hook ───────────────────────────────────────────────────────────
  const params = useMemo<GetPayrollDraftsParams>(
    () => ({
      page: queryParams.page ?? 1,
      perPage: queryParams.perPage ?? 10,
      sortBy: isPayrollDraftSortField(queryParams.sortBy) ? queryParams.sortBy : undefined,
      sortOrder: (queryParams.sortOrder || 'asc') as 'asc' | 'desc',
      search: queryParams.search,
      periodType: queryParams.periodType as PeriodeType | undefined,
      status: queryParams.status,
      periodStart: queryParams.periodStart,
      periodEnd: queryParams.periodEnd,
    }),
    [queryParams]
  );

  const pageOptions = useMemo(
    () => ({
      params,
      companyId,
      setQueryParams,
    }),
    [params, companyId, setQueryParams]
  );

  const {
    drafts,
    totalItems,
    totalPages,
    isLoading,
    isError,
    refetchDrafts,
    isCreating,
    handleSearchChange,
    handleSort,
    handlePaginationChange,
    handleCreateDraft,
    handleOpenDraft,
  } = usePayrollDraftPage(pageOptions);

  // ── Table Columns ───────────────────────────────────────────────────────
  const columns = useMemo<ColumnDef<PayrollDraftSummary>[]>(
    () => [
      {
        accessorKey: 'code',
        header: PAYROLL_DRAFT_LABELS.COLUMNS.CODE,
        cell: ({ row }) => (
          <Button
            type="button"
            variant="link"
            size="sm"
            className="h-auto p-0 text-teal-600 hover:text-teal-700"
            onClick={() => handleOpenDraft(row.original.id)}
          >
            {row.original.code}
          </Button>
        ),
      },
      {
        accessorKey: 'periodStart',
        header: PAYROLL_DRAFT_LABELS.COLUMNS.PERIODE,
        cell: ({ row }) =>
          `${formatDate(row.original.periodStart)} - ${formatDate(row.original.periodEnd)}`,
      },
      {
        accessorKey: 'totalAmount',
        header: PAYROLL_DRAFT_LABELS.COLUMNS.TOTAL_AMOUNT,
        cell: ({ row }) =>
          formatCurrencyIDR(
            row.original.totalAmount !== null ? Number(row.original.totalAmount) : null
          ),
      },
      {
        accessorKey: 'periodType',
        header: PAYROLL_DRAFT_LABELS.COLUMNS.PERIOD_TYPE,
        cell: ({ row }) => <PeriodeTypeBadge type={row.original.periodType} />,
      },
      {
        accessorKey: 'status',
        header: PAYROLL_DRAFT_LABELS.COLUMNS.STATUS,
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: 'notes',
        header: PAYROLL_DRAFT_LABELS.COLUMNS.NOTES,
        enableSorting: false,
        cell: ({ row }) => (
          <span className="max-w-50 truncate block">{row.original.notes || '-'}</span>
        ),
      },
      {
        id: 'actions',
        header: PAYROLL_DRAFT_LABELS.COLUMNS.ACTION,
        enableSorting: false,
        cell: ({ row }) => (
          <Button
            variant="link"
            size="sm"
            className="text-teal-600 hover:text-teal-700"
            onClick={() => handleOpenDraft(row.original.id)}
          >
            {PAYROLL_DRAFT_LABELS.ACTIONS.DETAIL}
          </Button>
        ),
      },
    ],
    [handleOpenDraft]
  );

  const initialSorting: SortingState = params.sortBy
    ? [{ id: params.sortBy, desc: params.sortOrder === 'desc' }]
    : [];

  const handleSortingChange = useCallback(
    (newSorting: SortingState) => {
      handleSort(newSorting);
    },
    [handleSort]
  );

  return (
    <>
      <PageTableTemplate
        title={PAYROLL_DRAFT_LABELS.PAGE_TITLE}
        headerActions={
          <div className="flex items-center gap-2">
            <AsyncSelect
              className="w-52"
              options={companyOptions}
              value={companyId ?? null}
              onChange={handleCompanyChange}
              placeholder="Company"
              isSearchable={false}
              isClearable={false}
            />
            <Button
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => setModalOpen(true)}
              disabled={!companyId}
            >
              {PAYROLL_DRAFT_LABELS.CREATE_BUTTON}
            </Button>
          </div>
        }
        search={queryParams.search}
        onSearchChange={handleSearchChange}
        searchPlaceholder={PAYROLL_DRAFT_LABELS.SEARCH_PLACEHOLDER}
        toolbarRight={
          <div className="flex items-center gap-2">
            <AsyncSelect
              placeholder="Periode Type"
              options={PERIOD_TYPE_OPTIONS}
              value={queryParams.periodType ?? null}
              onChange={(value) => updateQueryParam('periodType', value as string)}
              isClearable
            />
            <DatePicker
              mode="range"
              value={dateRange}
              onChange={(range) => {
                const isRange = range && 'from' in range;
                const r = isRange ? (range as DateRange) : undefined;

                // Only refetch once both ends of the range are set; a lone
                // `from` or `to` is an in-progress selection, not a filter yet.
                if (!r || (!r.from && !r.to)) {
                  setQueryParams({
                    periodStart: undefined,
                    periodEnd: undefined,
                    page: '1',
                  } as any);
                  return;
                }
                if (!r.from || !r.to) return;

                setQueryParams({
                  periodStart: format(r.from, 'yyyy-MM-dd'),
                  periodEnd: format(r.to, 'yyyy-MM-dd'),
                  page: '1',
                } as any);
              }}
              rangePlaceholder="Date Range"
              className="w-40"
            />
            <AsyncSelect
              placeholder="Status"
              options={STATUS_OPTIONS}
              value={queryParams.status ?? null}
              onChange={(value) => {
                const val = Array.isArray(value) ? value[0] : value;
                setQueryParams({ status: (val as string) || undefined, page: '1' } as any);
              }}
            />
          </div>
        }
      >
        {isError ? (
          <Alert variant="destructive">
            <div className="flex flex-col items-start gap-3">
              <div>
                <AlertTitle>Payroll draft gagal dimuat</AlertTitle>
                <AlertDescription>Periksa koneksi atau coba muat ulang data.</AlertDescription>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => refetchDrafts()}>
                Coba Lagi
              </Button>
            </div>
          </Alert>
        ) : (
          <DataTableLayout
            columns={columns}
            data={drafts}
            initialSorting={initialSorting}
            onSortingChange={handleSortingChange}
            initialPage={queryParams.page ?? 1}
            initialPageSize={queryParams.perPage ?? 10}
            onPaginationChange={handlePaginationChange}
            totalItems={totalItems}
            totalPages={totalPages}
            emptyMessage={PAYROLL_DRAFT_LABELS.EMPTY.TITLE}
            enableRowSelection={false}
            enableColumnResize={false}
            enableColumnDnd={false}
            enablePagination
            enableZebraStripes={false}
            className="shadow-none rounded-none"
            isLoading={isLoading}
          />
        )}
      </PageTableTemplate>

      <CreateDraftModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreateDraft}
        isSubmitting={isCreating}
      />
    </>
  );
}
