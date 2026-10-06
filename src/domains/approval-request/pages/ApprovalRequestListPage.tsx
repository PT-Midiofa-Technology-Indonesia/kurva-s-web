'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';
import { useQueryParams } from '@/hooks/use-query-params';
import { AsyncSelect } from '@/shared/components/atoms';
import { ListPageTemplate } from '@/shared/components/templates/ListPageTemplate';
import { Badge, Button } from '@/shared/components/ui';
import { useCompanyFilter } from '@/shared/hooks/use-company-filter';
import { useApprovalRequestStatuses } from '@/shared/hooks/use-enums';
import type { BaseQueryParams } from '@/types/query-params';

import {
  APPROVAL_REQUEST_LABELS,
  APPROVAL_REQUEST_STATUS_LABELS,
  APPROVAL_REQUEST_STATUS_VARIANTS,
} from '../constants';
import { useApprovalRequestPage } from '../hooks/use-approval-request-page';
import type { ApprovalRequest, ApprovalRequestStatus } from '../types';

interface ApprovalRequestUrlParams extends BaseQueryParams {
  status?: string;
  companyId?: string;
}

function StatusBadge({ status }: { status: ApprovalRequestStatus }) {
  const variant = APPROVAL_REQUEST_STATUS_VARIANTS[status] ?? 'secondary';
  const label = APPROVAL_REQUEST_STATUS_LABELS[status] ?? status;
  return <Badge variant={variant}>{label}</Badge>;
}

export function ApprovalRequestListPage() {
  const { queryParams, updateQueryParam, setQueryParams } =
    useQueryParams<ApprovalRequestUrlParams>();

  const { companyId, companyOptions, handleCompanyChange } = useCompanyFilter();

  const { data: statusOptions = [] } = useApprovalRequestStatuses();

  const params = useMemo(
    () => ({
      page: queryParams.page ?? 1,
      perPage: queryParams.perPage ?? 10,
      sortBy: queryParams.sortBy,
      sortOrder: (queryParams.sortOrder || 'asc') as 'asc' | 'desc',
      search: queryParams.search,
      status: queryParams.status,
      companyId,
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
    approvalRequests,
    totalItems,
    totalPages,
    isLoading,
    isError,
    handleViewDetail,
    handleStatusChange,
    handleSearchChange,
    handleSort,
    handlePaginationChange,
  } = useApprovalRequestPage(pageOptions);

  const columns = useMemo<ColumnDef<ApprovalRequest>[]>(
    () => [
      {
        accessorKey: 'code',
        header: APPROVAL_REQUEST_LABELS.LIST.COLUMNS.CODE,
        enableSorting: false,
        cell: ({ row }) => (
          <span className="inline-flex items-center rounded bg-slate-100 px-2 py-0.5 text-sm font-medium text-slate-700">
            {row.original.code}
          </span>
        ),
      },
      {
        accessorKey: 'workflow',
        header: APPROVAL_REQUEST_LABELS.LIST.COLUMNS.WORKFLOW_NAME,
        enableSorting: true,
        cell: ({ row }) => <span>{row.original.workflow.name}</span>,
      },
      {
        accessorKey: 'currentStepOrder',
        header: APPROVAL_REQUEST_LABELS.LIST.COLUMNS.WAKTU_PENGAJUAN,
        enableSorting: false,
        cell: ({ row }) => (
          <Badge variant="outline" className="rounded-full">
            {row.original.currentStepOrder}
          </Badge>
        ),
      },
      {
        accessorKey: 'status',
        header: APPROVAL_REQUEST_LABELS.LIST.COLUMNS.STATUS,
        enableSorting: true,
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        id: 'actions',
        header: APPROVAL_REQUEST_LABELS.LIST.COLUMNS.ACTIONS,
        enableSorting: false,
        enableHiding: false,
        size: 140,
        cell: ({ row }) => (
          <Button
            variant="link"
            size="sm"
            onClick={() => handleViewDetail(row.original.id)}
            className="h-auto p-0"
          >
            {APPROVAL_REQUEST_LABELS.LIST.ACTIONS.VIEW}
          </Button>
        ),
      },
    ],
    [handleViewDetail]
  );

  return (
    <ListPageTemplate<ApprovalRequest>
      title={APPROVAL_REQUEST_LABELS.LIST.TITLE}
      headerActions={
        <AsyncSelect
          className="w-52"
          options={companyOptions}
          value={companyId ?? null}
          onChange={handleCompanyChange}
          placeholder={APPROVAL_REQUEST_LABELS.LIST.FILTERS.COMPANY}
          isSearchable={false}
          isClearable={false}
        />
      }
      data={approvalRequests}
      columns={columns}
      isLoading={isLoading}
      isError={isError}
      emptyMessage={APPROVAL_REQUEST_LABELS.LIST.EMPTY}
      search={queryParams.search}
      searchPlaceholder={APPROVAL_REQUEST_LABELS.LIST.SEARCH_PLACEHOLDER}
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
        <AsyncSelect
          className="w-48"
          options={statusOptions}
          placeholder={APPROVAL_REQUEST_LABELS.LIST.FILTERS.STATUS}
          isSearchable={false}
          onChange={handleStatusChange}
          isClearable
        />
      }
    />
  );
}
