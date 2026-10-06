'use client';

import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo } from 'react';
import { useProjectsInfinite } from '@/domains/project-control';
import { AsyncSelect, Button, type SelectValue } from '@/shared/components/atoms';
import { ConfirmDialog } from '@/shared/components/molecules/AlertDialog';
import { DataTableLayout } from '@/shared/components/templates/DataTableLayout';
import { PageTableTemplate } from '@/shared/components/templates/PageTableTemplate';
import { Badge } from '@/shared/components/ui/badge';
import { useCompanyFilter } from '@/shared/hooks/use-company-filter';
import { usePurchaseOrderDraftStatuses } from '@/shared/hooks/use-enums';
import { useQueryParams } from '@/shared/hooks/use-query-params';
import { formatDateLong as formatDate } from '@/shared/utils/format';
import type { BaseQueryParams } from '@/types/query-params';
import { PoDraftActionsCell } from '../components/PoDraftActionsCell';
import { PO_DRAFT_STATUS_BADGE, PROCUREMENT_LABELS } from '../constants';
import { usePoDraftPage } from '../hooks/use-po-draft-page';
import type { PoDraftItem } from '../types/po-draft';

interface PoDraftUrlParams extends BaseQueryParams {
  companyId?: string;
  type?: string;
  status?: string;
  projectId?: string;
}

function StatusBadge({ status }: { status: string }) {
  const badge = PO_DRAFT_STATUS_BADGE[status] ?? {
    label: status,
    variant: 'secondary' as const,
  };
  return <Badge variant={badge.variant}>{badge.label}</Badge>;
}

export function PurchasePlanningListPage() {
  const router = useRouter();
  const { queryParams, updateQueryParam, setQueryParams } = useQueryParams<PoDraftUrlParams>();

  const { companyId, companyOptions, handleCompanyChange } = useCompanyFilter();
  const { data: statusOptions = [] } = usePurchaseOrderDraftStatuses();
  useEffect(() => {
    if (!queryParams.type) {
      setQueryParams({ type: 'materialTool' } as Partial<PoDraftUrlParams>);
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
      { id: 'materialTool', label: PROCUREMENT_LABELS.PURCHASE_PLANNING.TABS.MATERIAL_TOOL },
      { id: 'serviceRental', label: PROCUREMENT_LABELS.PURCHASE_PLANNING.TABS.SERVICE_RENTAL },
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
  } = usePoDraftPage(pageOptions);

  // ── View handler ──
  const handleView = useCallback(
    (item: PoDraftItem) => {
      router.push(
        `/procurement/purchase-planning/${item.id}?companyId=${companyId}&type=${item.type}`
      );
    },
    [router, companyId]
  );

  // ── Columns ──
  const columns = useMemo<ColumnDef<PoDraftItem>[]>(
    () => [
      {
        accessorKey: 'code',
        header: PROCUREMENT_LABELS.PURCHASE_PLANNING.COLUMNS.CODE,
      },
      {
        id: 'project',
        header: PROCUREMENT_LABELS.PURCHASE_PLANNING.COLUMNS.PROJECT,
        cell: ({ row }) => (
          <span>
            {row.original.projectCode} - {row.original.projectName}
          </span>
        ),
      },
      {
        accessorKey: 'type',
        header: PROCUREMENT_LABELS.PURCHASE_PLANNING.COLUMNS.TYPE,
      },
      {
        id: 'createdBy',
        header: PROCUREMENT_LABELS.PURCHASE_PLANNING.COLUMNS.CREATED_BY,
        cell: ({ row }) => row.original.createdBy?.name ?? '-',
      },
      {
        accessorKey: 'createdAt',
        header: PROCUREMENT_LABELS.PURCHASE_PLANNING.COLUMNS.CREATED_AT,
        cell: ({ row }) => formatDate(row.original.createdAt),
      },
      {
        id: 'status',
        header: PROCUREMENT_LABELS.PURCHASE_PLANNING.COLUMNS.STATUS,
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        id: 'actions',
        header: PROCUREMENT_LABELS.PURCHASE_PLANNING.COLUMNS.ACTIONS,
        enableSorting: false,
        enableHiding: false,
        size: 60,
        cell: ({ row }) => (
          <PoDraftActionsCell
            status={row.original.status}
            onView={() => handleView(row.original)}
            onCancelClick={() => handleDeleteClick(row.original)}
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
        title={PROCUREMENT_LABELS.PURCHASE_PLANNING.TITLE}
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
              variant="default"
              onClick={() =>
                router.push(
                  `/procurement/purchase-planning/create?companyId=${companyId}&type=${activeTab}`
                )
              }
            >
              {PROCUREMENT_LABELS.PURCHASE_PLANNING.ADD_BUTTON}
            </Button>
          </div>
        }
        search={queryParams.search}
        onSearchChange={handleSearchChange}
        searchPlaceholder={PROCUREMENT_LABELS.PURCHASE_PLANNING.SEARCH}
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
            emptyMessage={PROCUREMENT_LABELS.PURCHASE_PLANNING.EMPTY}
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
        title={PROCUREMENT_LABELS.DIALOG.CANCEL_DRAFT_TITLE}
        description={PROCUREMENT_LABELS.DIALOG.CANCEL_DRAFT_DESCRIPTION}
        cancelText="Batal"
        confirmText="Ya, Cancel Draft"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}
