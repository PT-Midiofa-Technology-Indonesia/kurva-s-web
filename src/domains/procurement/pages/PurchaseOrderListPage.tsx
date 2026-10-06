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
import { usePurchaseOrderStatuses } from '@/shared/hooks/use-enums';
import { useQueryParams } from '@/shared/hooks/use-query-params';
import { formatIDR } from '@/shared/utils/currency';
import type { BaseQueryParams } from '@/types/query-params';
import { PoActionsCell } from '../components/PoActionsCell';
import { PO_STATUS_BADGE, PROCUREMENT_LABELS } from '../constants';
import { usePoPage } from '../hooks/use-po-page';
import type { PurchaseOrderItem } from '../types/purchase-order';

interface PoUrlParams extends BaseQueryParams {
  companyId?: string;
  type?: string;
  status?: string;
  projectId?: string;
}

function StatusBadge({ status }: { status: string }) {
  const badge = PO_STATUS_BADGE[status] ??
    PO_STATUS_BADGE[status?.toLowerCase()] ?? { label: status, variant: 'secondary' as const };
  return (
    <Badge variant={badge.variant} className={badge.className}>
      {badge.label}
    </Badge>
  );
}

export function PurchaseOrderListPage() {
  const router = useRouter();
  const { queryParams, updateQueryParam, setQueryParams } = useQueryParams<PoUrlParams>();

  const { companyId, companyOptions, handleCompanyChange } = useCompanyFilter();
  const { data: statusOptions = [] } = usePurchaseOrderStatuses();
  useEffect(() => {
    if (!queryParams.type) {
      setQueryParams({ type: 'materialTool' } as Partial<PoUrlParams>);
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
      { id: 'materialTool', label: PROCUREMENT_LABELS.PURCHASE_ORDER.TABS.MATERIAL_TOOL },
      { id: 'serviceRental', label: PROCUREMENT_LABELS.PURCHASE_ORDER.TABS.SERVICE_RENTAL },
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
    issueTarget,
    setIssueTarget,
    handleIssueClick,
    handleIssueConfirm,
    cancelTarget,
    setCancelTarget,
    handleCancelClick,
    handleCancelConfirm,
  } = usePoPage(pageOptions);

  // ── Detail handler ──
  const handleDetail = useCallback(
    (item: PurchaseOrderItem) => {
      router.push(`/procurement/purchase-order/${item.id}?companyId=${companyId}`);
    },
    [router, companyId]
  );

  // ── Columns ──
  const columns = useMemo<ColumnDef<PurchaseOrderItem>[]>(
    () => [
      {
        accessorKey: 'code',
        header: PROCUREMENT_LABELS.PURCHASE_ORDER.COLUMNS.CODE,
      },
      {
        id: 'project',
        header: PROCUREMENT_LABELS.PURCHASE_ORDER.COLUMNS.PROJECT,
        cell: ({ row }) => (
          <span>
            {row.original.project.code} - {row.original.project.name}
          </span>
        ),
      },
      {
        accessorKey: 'type',
        header: PROCUREMENT_LABELS.PURCHASE_ORDER.COLUMNS.TYPE,
      },
      {
        id: 'vendor',
        header: PROCUREMENT_LABELS.PURCHASE_ORDER.COLUMNS.VENDOR,
        cell: ({ row }) => row.original.vendor.name,
      },
      {
        accessorKey: 'totalAmount',
        header: PROCUREMENT_LABELS.PURCHASE_ORDER.COLUMNS.TOTAL_PRICE,
        cell: ({ row }) => formatIDR(row.original.totalAmount),
      },
      {
        id: 'createdBy',
        header: PROCUREMENT_LABELS.PURCHASE_ORDER.COLUMNS.CREATED_BY,
        cell: ({ row }) => row.original.createdBy?.name ?? '-',
      },
      {
        id: 'status',
        header: PROCUREMENT_LABELS.PURCHASE_ORDER.COLUMNS.STATUS,
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        id: 'actions',
        header: PROCUREMENT_LABELS.PURCHASE_ORDER.COLUMNS.ACTIONS,
        enableSorting: false,
        enableHiding: false,
        size: 60,
        cell: ({ row }) => (
          <PoActionsCell
            status={row.original.status}
            onDetail={() => handleDetail(row.original)}
            onIssue={() => handleIssueClick(row.original)}
            onCancel={() => handleCancelClick(row.original)}
          />
        ),
      },
    ],
    [handleDetail, handleIssueClick, handleCancelClick]
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
        title={PROCUREMENT_LABELS.PURCHASE_ORDER.TITLE}
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
        searchPlaceholder={PROCUREMENT_LABELS.PURCHASE_ORDER.SEARCH}
        toolbarRight={
          <div className="flex items-center gap-3">
            {/* Tab filter */}
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
              options={statusOptions}
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
            emptyMessage={PROCUREMENT_LABELS.PURCHASE_ORDER.EMPTY}
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

      {/* Issue confirm */}
      <ConfirmDialog
        open={issueTarget !== null}
        onOpenChange={(open: boolean) => {
          if (!open) setIssueTarget(null);
        }}
        variant="default"
        title={PROCUREMENT_LABELS.DIALOG.ISSUE_PO_TITLE}
        description={PROCUREMENT_LABELS.DIALOG.ISSUE_PO_DESCRIPTION}
        cancelText="Batal"
        confirmText="Ya, Issue"
        onCancel={() => setIssueTarget(null)}
        onConfirm={handleIssueConfirm}
      />

      {/* Cancel confirm */}
      <ConfirmDialog
        open={cancelTarget !== null}
        onOpenChange={(open: boolean) => {
          if (!open) setCancelTarget(null);
        }}
        variant="danger"
        title={PROCUREMENT_LABELS.DIALOG.CANCEL_PO_TITLE}
        description={PROCUREMENT_LABELS.DIALOG.CANCEL_PO_DESCRIPTION}
        cancelText="Batal"
        confirmText="Ya, Cancel"
        onCancel={() => setCancelTarget(null)}
        onConfirm={handleCancelConfirm}
      />
    </>
  );
}
