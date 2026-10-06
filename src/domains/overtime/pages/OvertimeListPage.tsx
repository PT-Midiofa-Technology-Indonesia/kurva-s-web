'use client';

import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { Ban, EllipsisVertical, Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import { AsyncSelect, Button } from '@/shared/components/atoms';
import { ConfirmDialog } from '@/shared/components/molecules/AlertDialog';
import { DataTableLayout } from '@/shared/components/templates/DataTableLayout';
import { PageTableTemplate } from '@/shared/components/templates/PageTableTemplate';
import { Separator } from '@/shared/components/ui';
import { Badge } from '@/shared/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { useCompanyFilter } from '@/shared/hooks/use-company-filter';
import { useQueryParams } from '@/shared/hooks/use-query-params';
import { formatIDR } from '@/shared/utils/currency';
import { formatDateLong as formatDate } from '@/shared/utils/format';
import type { BaseQueryParams } from '@/types/query-params';
import { OvertimeDetailDrawer } from '../components/OvertimeDetailDrawer';
import { OvertimeFilterDrawer } from '../components/OvertimeFilterDrawer';
import { OvertimeFormDrawer } from '../components/OvertimeFormDrawer';
import { OVERTIME_LABELS, OVERTIME_STATUS_BADGE } from '../constants';
import { useCancelOvertime } from '../hooks/use-cancel-overtime';
import { useOvertimePage } from '../hooks/use-overtime-page';
import type { OvertimeListItem } from '../types';

interface OvertimeUrlParams extends BaseQueryParams {
  companyId?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  employeeIds?: string;
  projectIds?: string;
}

function OvertimeActionsCell({
  onView,
  onEdit,
  onDeleteClick,
  onCancelClick,
}: {
  onView?: () => void;
  onEdit?: () => void;
  onDeleteClick?: () => void;
  onCancelClick?: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-6 w-6 p-0">
          <EllipsisVertical className="h-4 w-4 text-slate-950" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onView}>
          <Eye className="mr-2 h-4 w-4" />
          {OVERTIME_LABELS.ACTIONS.VIEW}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onEdit}>
          <Pencil className="mr-2 h-4 w-4" />
          {OVERTIME_LABELS.ACTIONS.EDIT}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onCancelClick}>
          <Ban className="mr-2 h-4 w-4" />
          {OVERTIME_LABELS.ACTIONS.CANCEL}
        </DropdownMenuItem>
        <Separator className="flex-1 h-[0.05rem]" />
        <DropdownMenuItem
          onClick={onDeleteClick}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          {OVERTIME_LABELS.ACTIONS.DELETE}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function StatusBadge({ status }: { status: string }) {
  const badge = OVERTIME_STATUS_BADGE[status] ?? { label: status, variant: 'secondary' as const };
  return <Badge variant={badge.variant}>{badge.label}</Badge>;
}

export function OvertimeListPage() {
  const router = useRouter();
  const { queryParams, updateQueryParam, setQueryParams } = useQueryParams<OvertimeUrlParams>();

  const { companyId, companyOptions, handleCompanyChange } = useCompanyFilter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detailDrawerId, setDetailDrawerId] = useState<string | null>(null);
  const [cancelTarget, setCancelTarget] = useState<OvertimeListItem | null>(null);
  const { mutate: cancelOvertimeAction } = useCancelOvertime();

  // ── Active filter count ──
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (queryParams.startDate || queryParams.endDate) count++;
    if (queryParams.status) count++;
    if (queryParams.employeeIds) count++;
    if (queryParams.projectIds) count++;
    return count;
  }, [queryParams]);

  // ── Companies ──

  // ── Parse filter values from URL ──
  const filterValues = useMemo(() => {
    const vals: Record<string, unknown> = {};
    if (queryParams.startDate || queryParams.endDate) {
      vals.dateRange = {
        startDate: queryParams.startDate ?? '',
        endDate: queryParams.endDate ?? '',
      };
    }
    if (queryParams.status) {
      vals.status = queryParams.status;
    }
    if (queryParams.employeeIds) {
      vals.employee = queryParams.employeeIds.split(',');
    }
    if (queryParams.projectIds) {
      vals.project = queryParams.projectIds.split(',');
    }
    return vals;
  }, [queryParams]);

  // ── Table params ──
  const params = useMemo(() => {
    const p: Record<string, any> = {
      page: queryParams.page ?? 1,
      perPage: queryParams.perPage ?? 10,
      sortBy: queryParams.sortBy,
      sortOrder: (queryParams.sortOrder || 'asc') as 'asc' | 'desc',
      search: queryParams.search,
      companyId,
    };
    if (queryParams.startDate) p.startDate = queryParams.startDate;
    if (queryParams.endDate) p.endDate = queryParams.endDate;
    if (queryParams.status) p.status = queryParams.status;
    if (queryParams.employeeIds) p.employeeIds = queryParams.employeeIds.split(',');
    if (queryParams.projectIds) p.projectIds = queryParams.projectIds.split(',');
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
    overtimes,
    totalItems,
    totalPages,
    isLoading,
    isError,
    handleSearchChange,
    handleSort,
    handlePaginationChange,
    formDrawerEditId,
    formDrawerOpen,
    handleAdd,
    handleEdit,
    handleFormDrawerClose,
    handleFormDrawerSuccess,
    deleteTarget,
    setDeleteTarget,
    handleDeleteClick,
    handleDeleteConfirm,
  } = useOvertimePage(pageOptions);

  // ── Filter apply handler ──
  const handleFilterApply = useCallback(
    (vals: Record<string, unknown>) => {
      const updates: Record<string, string | undefined> = { page: '1' };
      if (vals.dateRange) {
        const dr = vals.dateRange as { startDate: string; endDate: string };
        updates.startDate = dr.startDate || undefined;
        updates.endDate = dr.endDate || undefined;
      } else {
        updates.startDate = undefined;
        updates.endDate = undefined;
      }
      if (vals.status) {
        updates.status = vals.status as string;
      } else {
        updates.status = undefined;
      }
      if (vals.employee && Array.isArray(vals.employee) && vals.employee.length > 0) {
        updates.employeeIds = (vals.employee as string[]).join(',');
      } else {
        updates.employeeIds = undefined;
      }
      if (vals.project && Array.isArray(vals.project) && vals.project.length > 0) {
        updates.projectIds = (vals.project as string[]).join(',');
      } else {
        updates.projectIds = undefined;
      }
      setQueryParams(updates as any);
    },
    [setQueryParams]
  );

  // ── Columns ──
  const columns = useMemo<ColumnDef<OvertimeListItem>[]>(
    () => [
      {
        id: 'overtimeDate',
        accessorKey: 'overtimeDate',
        header: OVERTIME_LABELS.LIST.COLUMNS.DATE,
        cell: ({ row }) => formatDate(row.original.overtimeDate),
      },
      {
        id: 'employee.fullName',
        header: OVERTIME_LABELS.LIST.COLUMNS.NAME,
        cell: ({ row }) => (
          <span className="underline underline-offset-2 cursor-pointer">
            {row.original.employee.fullName}
          </span>
        ),
      },
      {
        accessorKey: 'startTime',
        header: OVERTIME_LABELS.LIST.COLUMNS.START_TIME,
        cell: ({ row }) => row.original.startTime || '-',
      },
      {
        accessorKey: 'endTime',
        header: OVERTIME_LABELS.LIST.COLUMNS.END_TIME,
        cell: ({ row }) => row.original.endTime || '-',
      },
      {
        accessorKey: 'totalMinutes',
        header: OVERTIME_LABELS.LIST.COLUMNS.DURATION,
        cell: ({ row }) => `${row.original.totalMinutes} minutes`,
      },
      {
        accessorKey: 'ratePerHourSnapshot',
        header: OVERTIME_LABELS.LIST.COLUMNS.RATE,
        cell: ({ row }) => formatIDR(row.original.ratePerHourSnapshot),
      },
      {
        accessorKey: 'amount',
        header: OVERTIME_LABELS.LIST.COLUMNS.AMOUNT,
        cell: ({ row }) => formatIDR(row.original.amount),
      },
      {
        accessorKey: 'locationType',
        header: OVERTIME_LABELS.LIST.COLUMNS.LOCATION,
        cell: ({ row }) => row.original.locationType,
      },
      {
        id: 'project',
        header: OVERTIME_LABELS.LIST.COLUMNS.PROJECT,
        cell: ({ row }) => row.original.project?.name ?? '-',
      },
      {
        id: 'status',
        header: OVERTIME_LABELS.LIST.COLUMNS.STATUS,
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        id: 'actions',
        header: OVERTIME_LABELS.LIST.COLUMNS.ACTIONS,
        enableSorting: false,
        enableHiding: false,
        size: 60,
        cell: ({ row }) => (
          <OvertimeActionsCell
            onView={() => setDetailDrawerId(row.original.id)}
            onEdit={() => handleEdit(row.original)}
            onCancelClick={() => setCancelTarget(row.original)}
            onDeleteClick={() => handleDeleteClick(row.original)}
          />
        ),
      },
    ],
    [handleEdit, handleDeleteClick]
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

  const handleCancelConfirm = useCallback(() => {
    if (!cancelTarget || !companyId) return;
    cancelOvertimeAction(
      { id: cancelTarget.id, companyId },
      {
        onSuccess: () => {
          setCancelTarget(null);
        },
      }
    );
  }, [cancelTarget, companyId, cancelOvertimeAction]);

  return (
    <>
      <PageTableTemplate
        title={OVERTIME_LABELS.LIST.TITLE}
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
              variant="outline"
              disabled={!companyId}
              onClick={() =>
                router.push(`/human-resource/overtime/settings?companyId=${companyId}`)
              }
            >
              {OVERTIME_LABELS.BUTTONS.SETTING}
            </Button>
            <Button leftIcon={<Plus className="h-4 w-4" />} variant="default" onClick={handleAdd}>
              {OVERTIME_LABELS.LIST.ADD_BUTTON}
            </Button>
          </div>
        }
        search={queryParams.search}
        onSearchChange={handleSearchChange}
        searchPlaceholder={OVERTIME_LABELS.LIST.SEARCH}
        toolbarRight={
          <Button variant="outline" onClick={() => setDrawerOpen(true)} className="relative">
            {OVERTIME_LABELS.LIST.FILTERS.FILTER}
            {activeFilterCount > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-teal-600 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </Button>
        }
      >
        {isError ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-red-600">Something went wrong. Please try again.</p>
          </div>
        ) : (
          <DataTableLayout
            columns={columns}
            data={overtimes}
            initialSorting={initialSorting}
            onSortingChange={handleSortingChange}
            initialPage={params.page}
            initialPageSize={params.perPage}
            onPaginationChange={handlePaginationChange}
            totalItems={totalItems}
            totalPages={totalPages}
            emptyMessage={OVERTIME_LABELS.LIST.EMPTY}
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

      <OvertimeFilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onApply={handleFilterApply}
        initialValues={filterValues}
        companyId={companyId}
      />

      <OvertimeDetailDrawer
        open={detailDrawerId !== null}
        onClose={() => setDetailDrawerId(null)}
        overtimeId={detailDrawerId}
        companyId={companyId ?? null}
      />

      <OvertimeFormDrawer
        open={formDrawerOpen}
        onClose={handleFormDrawerClose}
        onSuccess={handleFormDrawerSuccess}
        editId={formDrawerEditId}
        companyId={companyId ?? null}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        variant="danger"
        title={OVERTIME_LABELS.DIALOG.DELETE_TITLE}
        description={OVERTIME_LABELS.DIALOG.DELETE_DESCRIPTION}
        cancelText="Batal"
        confirmText="Ya, Hapus"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />

      <ConfirmDialog
        open={cancelTarget !== null}
        onOpenChange={(open) => {
          if (!open) setCancelTarget(null);
        }}
        variant="danger"
        title={OVERTIME_LABELS.DIALOG.CANCEL_TITLE}
        description={OVERTIME_LABELS.DIALOG.CANCEL_DESCRIPTION}
        cancelText="Batal"
        confirmText="Ya, Batalkan"
        onCancel={() => setCancelTarget(null)}
        onConfirm={handleCancelConfirm}
      />
    </>
  );
}
