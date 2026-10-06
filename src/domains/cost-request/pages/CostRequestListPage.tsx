'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import type { DateRange } from 'react-day-picker';
import { useProjectsInfinite } from '@/domains/project-control';
import { AsyncSelect, type SelectValue } from '@/shared/components/atoms';
import { DatePicker } from '@/shared/components/molecules/DatePicker/DatePicker';
import { ListPageTemplate } from '@/shared/components/templates/ListPageTemplate';
import { Badge } from '@/shared/components/ui/badge';
import { useCompanyFilter } from '@/shared/hooks/use-company-filter';
import { useCostRequestStatuses, useCostRequestTypes } from '@/shared/hooks/use-enums';
import { useQueryParams } from '@/shared/hooks/use-query-params';
import { formatIDR } from '@/shared/utils/currency';
import type { BaseQueryParams } from '@/types/query-params';
import { CancelCostRequestDialog } from '../components/CancelCostRequestDialog';
import { CostRequestActionsCell } from '../components/CostRequestActionsCell';
import { CostRequestFormModal } from '../components/CostRequestFormModal';
import { CreateCostRequestSplitButton } from '../components/CreateCostRequestSplitButton';
import {
  COST_REQUEST_LABELS,
  COST_REQUEST_STATUS_BADGE,
  COST_REQUEST_TYPE_BADGE,
} from '../constants';
import { useCostRequestListPage } from '../hooks/use-cost-request-list-page';
import type { CostRequest, CostRequestStatus, CostRequestType } from '../types';

interface CostRequestUrlParams extends BaseQueryParams {
  companyId?: string;
  requestType?: string;
  status?: string;
  projectId?: string;
  dueDateStart?: string;
  dueDateEnd?: string;
}

function toDate(value?: string) {
  return value ? new Date(`${value}T00:00:00`) : undefined;
}

function toDateRange(from?: string, to?: string): DateRange | undefined {
  if (!from && !to) return undefined;
  return { from: toDate(from), to: toDate(to) };
}

export function CostRequestListPage() {
  const router = useRouter();
  const { queryParams, updateQueryParam, setQueryParams } = useQueryParams<CostRequestUrlParams>();
  const { companyId, companyOptions, handleCompanyChange } = useCompanyFilter();

  const { data: requestTypeOptions = [] } = useCostRequestTypes();
  const { data: statusOptions = [] } = useCostRequestStatuses();

  const [createRequestType, setCreateRequestType] = useState<CostRequestType | null>(null);

  const { options: projectOptions } = useProjectsInfinite({ companyId, enabled: !!companyId });

  const params = useMemo(
    () => ({
      companyId,
      page: queryParams.page ?? 1,
      perPage: queryParams.perPage ?? 10,
      sortBy: queryParams.sortBy ?? 'dueDate',
      sortOrder: (queryParams.sortOrder || 'asc') as 'asc' | 'desc',
      search: queryParams.search,
      requestType: queryParams.requestType as CostRequestType | undefined,
      status: queryParams.status as CostRequestStatus | undefined,
      projectId: queryParams.projectId,
      dueDateStart: queryParams.dueDateStart,
      dueDateEnd: queryParams.dueDateEnd,
    }),
    [companyId, queryParams]
  );

  const pageOptions = useMemo(
    () => ({ params, onUpdateQueryParam: updateQueryParam, onSetQueryParams: setQueryParams }),
    [params, updateQueryParam, setQueryParams]
  );

  const {
    items,
    totalItems,
    totalPages,
    isLoading,
    isError,
    handleSearchChange,
    handleSort,
    handlePaginationChange,
    cancelTarget,
    setCancelTarget,
    handleCancelClick,
    handleCancelConfirm,
    isCancelling,
  } = useCostRequestListPage(pageOptions);

  const handleDetail = useCallback(
    (item: CostRequest) => {
      router.push(`/expense-management/cost-request/${item.id}?companyId=${companyId}`);
    },
    [router, companyId]
  );

  const dueDateRange = useMemo(
    () => toDateRange(queryParams.dueDateStart, queryParams.dueDateEnd),
    [queryParams.dueDateStart, queryParams.dueDateEnd]
  );

  const handleRequestTypeChange = useCallback(
    (value: SelectValue) => {
      const val = Array.isArray(value) ? value[0] : value;
      setQueryParams({
        requestType: (val as string) || undefined,
        page: 1,
      } as Partial<CostRequestUrlParams>);
    },
    [setQueryParams]
  );

  const handleStatusChange = useCallback(
    (value: SelectValue) => {
      const val = Array.isArray(value) ? value[0] : value;
      setQueryParams({
        status: (val as string) || undefined,
        page: 1,
      } as Partial<CostRequestUrlParams>);
    },
    [setQueryParams]
  );

  const handleProjectFilterChange = useCallback(
    (value: SelectValue) => {
      const val = Array.isArray(value) ? value[0] : value;
      setQueryParams({
        projectId: (val as string) || undefined,
        page: 1,
      } as Partial<CostRequestUrlParams>);
    },
    [setQueryParams]
  );

  const handleDueDateRangeChange = useCallback(
    (value: Date | DateRange | undefined) => {
      const range = value as DateRange | undefined;
      setQueryParams({
        dueDateStart: range?.from ? format(range.from, 'yyyy-MM-dd') : undefined,
        dueDateEnd: range?.to ? format(range.to, 'yyyy-MM-dd') : undefined,
        page: 1,
      } as Partial<CostRequestUrlParams>);
    },
    [setQueryParams]
  );

  const columns = useMemo<ColumnDef<CostRequest>[]>(
    () => [
      { accessorKey: 'code', header: COST_REQUEST_LABELS.LIST.COLUMNS.CODE },
      {
        id: 'requestType',
        header: COST_REQUEST_LABELS.LIST.COLUMNS.REQUEST_TYPE,
        cell: ({ row }) => {
          const badge = COST_REQUEST_TYPE_BADGE[row.original.requestType];
          return <Badge variant={badge.variant}>{badge.label}</Badge>;
        },
      },
      {
        id: 'project',
        header: COST_REQUEST_LABELS.LIST.COLUMNS.PROJECT,
        cell: ({ row }) => row.original.project?.name ?? '-',
      },
      {
        id: 'employee',
        header: COST_REQUEST_LABELS.LIST.COLUMNS.EMPLOYEE,
        cell: ({ row }) => row.original.employee?.name ?? '-',
      },
      {
        accessorKey: 'totalAmount',
        header: COST_REQUEST_LABELS.LIST.COLUMNS.TOTAL_AMOUNT,
        cell: ({ row }) => formatIDR(row.original.totalAmount),
      },
      {
        id: 'dueDate',
        header: COST_REQUEST_LABELS.LIST.COLUMNS.DUE_DATE,
        cell: ({ row }) => format(new Date(row.original.dueDate), 'dd MMM yyyy'),
      },
      {
        id: 'status',
        header: COST_REQUEST_LABELS.LIST.COLUMNS.STATUS,
        cell: ({ row }) => {
          const badge = COST_REQUEST_STATUS_BADGE[row.original.status];
          return <Badge variant={badge.variant}>{badge.label}</Badge>;
        },
      },
      {
        id: 'actions',
        header: COST_REQUEST_LABELS.LIST.COLUMNS.ACTIONS,
        enableSorting: false,
        cell: ({ row }) => (
          <CostRequestActionsCell
            status={row.original.status}
            onDetail={() => handleDetail(row.original)}
            onCancel={() => handleCancelClick(row.original)}
          />
        ),
      },
    ],
    [handleDetail, handleCancelClick]
  );

  const headerActions = (
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
      <CreateCostRequestSplitButton onSelect={(type) => setCreateRequestType(type)} />
    </div>
  );

  const toolbarRight = (
    <div className="flex items-center gap-2">
      <AsyncSelect
        className="w-40"
        options={requestTypeOptions}
        value={queryParams.requestType ?? null}
        onChange={handleRequestTypeChange}
        placeholder={COST_REQUEST_LABELS.LIST.FILTERS.REQUEST_TYPE}
        isSearchable={false}
        isClearable
      />
      <AsyncSelect
        className="w-36"
        options={statusOptions}
        value={queryParams.status ?? null}
        onChange={handleStatusChange}
        placeholder={COST_REQUEST_LABELS.LIST.FILTERS.STATUS}
        isSearchable={false}
        isClearable
      />
      <AsyncSelect
        className="w-40"
        options={projectOptions}
        value={queryParams.projectId ?? null}
        onChange={handleProjectFilterChange}
        placeholder={COST_REQUEST_LABELS.LIST.FILTERS.PROJECT}
        isSearchable
        isClearable
      />
      <DatePicker
        mode="range"
        value={dueDateRange}
        onChange={handleDueDateRangeChange}
        rangePlaceholder="dd/mm/yyyy"
      />
    </div>
  );

  return (
    <>
      <ListPageTemplate<CostRequest>
        title={COST_REQUEST_LABELS.LIST.TITLE}
        headerActions={headerActions}
        search={queryParams.search}
        searchPlaceholder={COST_REQUEST_LABELS.LIST.SEARCH}
        onSearchChange={handleSearchChange}
        toolbarRight={toolbarRight}
        data={items}
        columns={columns}
        isLoading={isLoading}
        isError={isError}
        emptyMessage={COST_REQUEST_LABELS.LIST.EMPTY}
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

      {createRequestType && (
        <CostRequestFormModal
          open
          onClose={() => setCreateRequestType(null)}
          requestType={createRequestType}
          companyId={companyId}
          onSuccess={() => setCreateRequestType(null)}
        />
      )}

      <CancelCostRequestDialog
        open={cancelTarget !== null}
        onOpenChange={(open) => !open && setCancelTarget(null)}
        onConfirm={handleCancelConfirm}
        isLoading={isCancelling}
      />
    </>
  );
}
