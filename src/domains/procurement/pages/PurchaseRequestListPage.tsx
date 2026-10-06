'use client';

import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo } from 'react';
import { useProjectsInfinite } from '@/domains/project-control';
import { AsyncSelect, type SelectValue } from '@/shared/components/atoms';
import { ConfirmDialog } from '@/shared/components/molecules/AlertDialog';
import { DataTableLayout } from '@/shared/components/templates/DataTableLayout';
import { PageTableTemplate } from '@/shared/components/templates/PageTableTemplate';
import { Badge } from '@/shared/components/ui/badge';
import { useCompanyFilter } from '@/shared/hooks/use-company-filter';
import { useQueryParams } from '@/shared/hooks/use-query-params';
import { formatDateLong as formatDate } from '@/shared/utils/format';
import type { BaseQueryParams } from '@/types/query-params';
import { PurchaseRequestActionsCell } from '../components/PurchaseRequestActionsCell';
import { PROCUREMENT_LABELS, PURCHASE_REQUEST_STATUS_BADGE } from '../constants';
import { usePurchaseRequestPage } from '../hooks/use-purchase-request-page';
import type { PurchaseRequestItem } from '../types';

interface PurchaseRequestUrlParams extends BaseQueryParams {
  companyId?: string;
  type?: string;
  status?: string;
  projectId?: string;
}

// ── Source badge ──
function SourceBadge({ source }: { source: string }) {
  const isBundle = source === 'bundle';
  return (
    <Badge variant={isBundle ? 'success' : 'secondary'}>{isBundle ? 'Bundle' : 'Manual'}</Badge>
  );
}

// ── Status badge ──
function StatusBadge({ status }: { status: string }) {
  const badge = PURCHASE_REQUEST_STATUS_BADGE[status] ?? {
    label: status,
    variant: 'secondary' as const,
  };
  return <Badge variant={badge.variant}>{badge.label}</Badge>;
}

// ── Status filter options ──
const STATUS_FILTER_OPTIONS = [
  { value: 'open', label: 'Open' },
  { value: 'closed', label: 'Closed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'waiting_approval', label: 'Waiting Approval' },
];

export function PurchaseRequestListPage() {
  const router = useRouter();
  const { queryParams, updateQueryParam, setQueryParams } =
    useQueryParams<PurchaseRequestUrlParams>();

  const { companyId, companyOptions, handleCompanyChange } = useCompanyFilter();

  useEffect(() => {
    if (!queryParams.type) {
      setQueryParams({ type: 'materialTool' } as Partial<PurchaseRequestUrlParams>);
    }
  }, [queryParams.type, setQueryParams]);

  // ── Projects ──
  const {
    options: projectOptions,
    isLoading: projectsLoading,
    hasMore: projectsHasMore,
    loadMore: projectsLoadMore,
  } = useProjectsInfinite({ perPage: 20, companyId });

  const handleProjectChange = useCallback(
    (value: SelectValue) => {
      const id = Array.isArray(value) ? value[0] : value;
      setQueryParams({ projectId: id ? (id as string) : undefined, page: '1' } as any);
    },
    [setQueryParams]
  );

  // ── Status filter ──
  const handleStatusChange = useCallback(
    (value: SelectValue) => {
      const val = Array.isArray(value) ? value[0] : value;
      setQueryParams({ status: val ? (val as string) : undefined, page: '1' } as any);
    },
    [setQueryParams]
  );

  // ── Tab state ──
  const activeTab = queryParams.type ?? 'materialTool';
  const tabs = useMemo(
    () => [
      { id: 'materialTool', label: PROCUREMENT_LABELS.PURCHASE_REQUEST.TABS.MATERIAL_TOOL },
      { id: 'serviceRental', label: PROCUREMENT_LABELS.PURCHASE_REQUEST.TABS.SERVICE_RENTAL },
    ],
    []
  );

  const handleTabChange = useCallback(
    (tabId: string) => {
      setQueryParams({ type: tabId || undefined, page: '1' } as any);
    },
    [setQueryParams]
  );

  // ── Table params ──
  const params = useMemo(() => {
    const p: Record<string, any> = {
      page: queryParams.page ?? 1,
      perPage: queryParams.perPage ?? 10,
      sortBy: queryParams.sortBy ?? 'createdAt',
      sortOrder: (queryParams.sortOrder || 'desc') as 'asc' | 'desc',
      search: queryParams.search,
      companyId,
    };
    if (queryParams.type) p.type = queryParams.type;
    if (queryParams.status) p.status = queryParams.status;
    if (queryParams.projectId) p.projectId = queryParams.projectId;
    return p;
  }, [queryParams, companyId]);

  const pageOptions = useMemo(
    () => ({
      params,
      onUpdateQueryParam: updateQueryParam,
      onSetQueryParams: setQueryParams,
    }),
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
    deleteTarget,
    setDeleteTarget,
    handleDeleteClick,
    handleDeleteConfirm,
  } = usePurchaseRequestPage(pageOptions);

  // ── View handler ──
  const handleView = useCallback(
    (item: PurchaseRequestItem) => {
      router.push(`/procurement/purchase-request/${item.id}?companyId=${companyId}`);
    },
    [router, companyId]
  );

  // ── Columns ──
  const columns = useMemo<ColumnDef<PurchaseRequestItem>[]>(
    () => [
      {
        accessorKey: 'code',
        header: PROCUREMENT_LABELS.PURCHASE_REQUEST.COLUMNS.CODE,
      },
      {
        id: 'project',
        header: PROCUREMENT_LABELS.PURCHASE_REQUEST.COLUMNS.PROJECT,
        cell: ({ row }) => (
          <span>
            {row.original.projectCode} - {row.original.projectName}
          </span>
        ),
      },
      {
        accessorKey: 'typeLabel',
        header: PROCUREMENT_LABELS.PURCHASE_REQUEST.COLUMNS.TYPE,
      },
      {
        id: 'source',
        header: PROCUREMENT_LABELS.PURCHASE_REQUEST.COLUMNS.SOURCE,
        cell: ({ row }) => <SourceBadge source={row.original.source} />,
      },
      {
        accessorKey: 'dateRequired',
        header: PROCUREMENT_LABELS.PURCHASE_REQUEST.COLUMNS.DATE_REQUIRED,
        cell: ({ row }) => formatDate(row.original.dateRequired),
      },
      {
        id: 'requestedBy',
        header: PROCUREMENT_LABELS.PURCHASE_REQUEST.COLUMNS.REQUESTED_BY,
        cell: ({ row }) => row.original.requestedBy?.name ?? '-',
      },
      {
        id: 'status',
        header: PROCUREMENT_LABELS.PURCHASE_REQUEST.COLUMNS.STATUS,
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        id: 'actions',
        header: PROCUREMENT_LABELS.PURCHASE_REQUEST.COLUMNS.ACTIONS,
        enableSorting: false,
        enableHiding: false,
        size: 60,
        cell: ({ row }) => (
          <PurchaseRequestActionsCell
            onView={() => handleView(row.original)}
            onDeleteClick={() => handleDeleteClick(row.original)}
          />
        ),
      },
    ],
    [handleView, handleDeleteClick]
  );

  const initialSorting: SortingState = params.sortBy
    ? [{ id: params.sortBy, desc: params.sortOrder === 'desc' }]
    : [];

  const handleSortingChange = useCallback(
    (newSorting: SortingState) => {
      if (newSorting.length > 0) {
        const { id, desc } = newSorting[0];
        handleSort(id, desc ? 'desc' : 'asc');
      } else {
        handleSort('', 'asc');
      }
    },
    [handleSort]
  );

  return (
    <>
      <PageTableTemplate
        title={PROCUREMENT_LABELS.PURCHASE_REQUEST.TITLE}
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
          </div>
        }
        search={queryParams.search}
        onSearchChange={handleSearchChange}
        searchPlaceholder={PROCUREMENT_LABELS.PURCHASE_REQUEST.SEARCH}
        toolbarRight={
          <div className="flex items-center gap-3">
            {/* Tab filter: Material & Tools / Service & Rental */}
            <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabChange(tab.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    activeTab === tab.id
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Project filter */}
            <AsyncSelect
              className="w-48"
              options={projectOptions}
              value={queryParams.projectId ?? null}
              onChange={handleProjectChange}
              placeholder="Semua Project"
              isSearchable
              isClearable
              isLoading={projectsLoading}
              onScrollToBottom={projectsHasMore ? () => projectsLoadMore() : undefined}
            />

            {/* Status filter */}
            <AsyncSelect
              className="w-40"
              options={STATUS_FILTER_OPTIONS}
              value={queryParams.status ?? null}
              onChange={handleStatusChange}
              placeholder="Semua Status"
              isSearchable={false}
              isClearable
            />
          </div>
        }
      >
        {isError ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-red-600">Something went wrong. Please try again.</p>
          </div>
        ) : (
          <DataTableLayout
            columns={columns}
            data={items}
            initialSorting={initialSorting}
            onSortingChange={handleSortingChange}
            initialPage={params.page}
            initialPageSize={params.perPage}
            onPaginationChange={handlePaginationChange}
            totalItems={totalItems}
            totalPages={totalPages}
            emptyMessage={PROCUREMENT_LABELS.PURCHASE_REQUEST.EMPTY}
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

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open: boolean) => {
          if (!open) setDeleteTarget(null);
        }}
        variant="danger"
        title={PROCUREMENT_LABELS.DIALOG.DELETE_TITLE}
        description={PROCUREMENT_LABELS.DIALOG.DELETE_DESCRIPTION}
        cancelText="Batal"
        confirmText="Ya, Hapus"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}
