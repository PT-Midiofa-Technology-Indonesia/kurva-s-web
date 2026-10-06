'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Eye, PlusIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { useQueryParams } from '@/hooks/use-query-params';
import { AsyncSelect, Button } from '@/shared/components/atoms';
import { ListPageTemplate } from '@/shared/components/templates/ListPageTemplate';
import { Badge } from '@/shared/components/ui';
import { useCompanyFilter } from '@/shared/hooks/use-company-filter';
import type { BaseQueryParams } from '@/types/query-params';

import { MOM_LABELS, MOM_STATUS_LABELS, MOM_STATUS_OPTIONS } from '../constants';
import { useMomListPage } from '../hooks/use-mom-list-page';
import type { MomRow, MomStatus } from '../types';

interface MomListUrlParams extends BaseQueryParams {
  status?: string;
  companyId?: string;
}

const labels = MOM_LABELS.LIST;

function formatMomDateTime(value: string): string {
  try {
    return format(new Date(value), 'd MMMM yyyy, HH:mm', { locale: id });
  } catch {
    return '-';
  }
}

const MOM_STATUS_BADGE_VARIANT: Record<MomStatus, 'success' | 'warning' | 'destructive'> = {
  published: 'success',
  draft: 'warning',
  cancelled: 'destructive',
};

function MomStatusBadge({ status }: { status: MomStatus }) {
  return <Badge variant={MOM_STATUS_BADGE_VARIANT[status]}>{MOM_STATUS_LABELS[status]}</Badge>;
}

export function MoMListPage() {
  const router = useRouter();
  const { queryParams, setQueryParams } = useQueryParams<MomListUrlParams>();
  const { companyId, companyOptions, handleCompanyChange } = useCompanyFilter();

  const params = useMemo(
    () => ({
      page: queryParams.page ?? 1,
      perPage: queryParams.perPage ?? 10,
      sortBy: queryParams.sortBy,
      sortOrder: (queryParams.sortOrder || 'asc') as 'asc' | 'desc',
      search: queryParams.search,
      status: queryParams.status as MomStatus | undefined,
      companyId: companyId ?? '',
    }),
    [companyId, queryParams]
  );

  const {
    rows,
    totalItems,
    totalPages,
    isLoading,
    handleStatusChange,
    handleSearchChange,
    handleSort,
    handlePaginationChange,
  } = useMomListPage({
    params,
    onSetQueryParams: setQueryParams,
  });

  const columns = useMemo<ColumnDef<MomRow>[]>(
    () => [
      {
        accessorKey: 'title',
        header: labels.COLUMNS.TITLE,
        enableSorting: false,
      },
      {
        accessorKey: 'startAt',
        header: labels.COLUMNS.START_AT,
        enableSorting: true,
        cell: ({ row }) => formatMomDateTime(row.original.startAt),
      },
      {
        accessorKey: 'endAt',
        header: labels.COLUMNS.END_AT,
        enableSorting: true,
        cell: ({ row }) => formatMomDateTime(row.original.endAt),
      },
      {
        accessorKey: 'location',
        header: labels.COLUMNS.LOCATION,
        enableSorting: false,
      },
      {
        accessorKey: 'status',
        header: labels.COLUMNS.STATUS,
        enableSorting: false,
        cell: ({ row }) => <MomStatusBadge status={row.original.status} />,
      },
      {
        id: 'actions',
        header: labels.COLUMNS.ACTIONS,
        enableSorting: false,
        enableHiding: false,
        size: 80,
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="xs"
            aria-label={labels.ACTIONS.VIEW}
            onClick={() =>
              router.push(`/meeting/mom/${row.original.id}?companyId=${params.companyId}`)
            }
          >
            <Eye className="h-4 w-4" />
          </Button>
        ),
      },
    ],
    [router, params.companyId]
  );

  return (
    <ListPageTemplate<MomRow>
      title={labels.TITLE}
      headerActions={
        <div className="flex items-center gap-3">
          <AsyncSelect
            className="w-40"
            options={companyOptions}
            value={params.companyId}
            onChange={handleCompanyChange}
            isSearchable={false}
            isClearable={false}
          />
          <Button
            leftIcon={<PlusIcon />}
            onClick={() => router.push(`/meeting/mom/create?companyId=${params.companyId}`)}
          >
            {labels.ADD_BUTTON}
          </Button>
        </div>
      }
      data={rows}
      columns={columns}
      isLoading={isLoading}
      emptyMessage={labels.EMPTY}
      search={queryParams.search}
      searchPlaceholder={labels.SEARCH_PLACEHOLDER}
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
          className="w-44"
          options={MOM_STATUS_OPTIONS}
          value={params.status}
          placeholder={labels.FILTERS.STATUS}
          isSearchable={false}
          onChange={handleStatusChange}
          isClearable
        />
      }
    />
  );
}
