'use client';

import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { EllipsisVertical, Eye, Pencil, Plus, Settings2, XCircle } from 'lucide-react';
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
import { formatDateLong as formatDate } from '@/shared/utils/format';
import type { BaseQueryParams } from '@/types/query-params';
import { LeaveDetailDrawer } from '../components/LeaveDetailDrawer';
import { LeaveFilterDrawer } from '../components/LeaveFilterDrawer';
import { LeaveFormDrawer } from '../components/LeaveFormDrawer';
import { LEAVE_LABELS, LEAVE_STATUS_BADGE } from '../constants';
import { useLeavePage } from '../hooks/use-leave-page';
import type { LeaveListItem } from '../types';
import { canEditLeave } from '../utils/leave-permissions';

interface LeaveUrlParams extends BaseQueryParams {
  companyId?: string;
  employee?: string;
  year?: string;
  status?: string;
  leaveType?: string;
}

function LeaveActionsCell({
  row,
  onView,
  onEdit,
  onCancel,
}: {
  row: LeaveListItem;
  onView: (item: LeaveListItem) => void;
  onEdit: (item: LeaveListItem) => void;
  onCancel: (item: LeaveListItem) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-6 w-6 p-0">
          <EllipsisVertical className="h-4 w-4 text-slate-950" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onView(row)}>
          <Eye className="mr-2 h-4 w-4" />
          {LEAVE_LABELS.ACTIONS.VIEW}
        </DropdownMenuItem>
        {canEditLeave(row.status) && (
          <DropdownMenuItem onClick={() => onEdit(row)}>
            <Pencil className="mr-2 h-4 w-4" />
            {LEAVE_LABELS.ACTIONS.EDIT}
          </DropdownMenuItem>
        )}
        {row.canCancel && (
          <>
            <Separator className="flex-1 h-[0.05rem]" />
            <DropdownMenuItem
              onClick={() => onCancel(row)}
              className="text-destructive focus:text-destructive"
            >
              <XCircle className="mr-2 h-4 w-4" />
              {LEAVE_LABELS.ACTIONS.CANCEL}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function StatusBadge({ status }: { status: string }) {
  const badge = LEAVE_STATUS_BADGE[status] ?? { label: status, variant: 'secondary' as const };
  return <Badge variant={badge.variant}>{badge.label}</Badge>;
}

export function LeaveListPage() {
  const router = useRouter();
  const { queryParams, setQueryParams } = useQueryParams<LeaveUrlParams>();

  const { companyId, companyOptions, handleCompanyChange } = useCompanyFilter();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (queryParams.employee) count++;
    if (queryParams.year) count++;
    if (queryParams.status) count++;
    if (queryParams.leaveType) count++;
    return count;
  }, [queryParams]);

  const filterValues = useMemo(() => {
    const values: Record<string, unknown> = {};

    if (queryParams.employee) values.employee = queryParams.employee;
    if (queryParams.year) values.year = queryParams.year;
    if (queryParams.status) values.status = queryParams.status;
    if (queryParams.leaveType) values.leaveType = queryParams.leaveType;

    return values;
  }, [queryParams]);

  const params = useMemo(() => {
    const nextParams: Record<string, any> = {
      page: queryParams.page ?? 1,
      perPage: queryParams.perPage ?? 10,
      sortBy: queryParams.sortBy,
      sortOrder: (queryParams.sortOrder || 'asc') as 'asc' | 'desc',
      search: queryParams.search,
      companyId,
    };

    if (queryParams.employee) nextParams.employeeId = queryParams.employee;
    if (queryParams.year) nextParams.year = queryParams.year;
    if (queryParams.status) nextParams.status = queryParams.status;
    if (queryParams.leaveType) nextParams.leaveTypeId = queryParams.leaveType;

    return nextParams;
  }, [queryParams, companyId]);

  const pageOptions = useMemo(
    () => ({
      params,
      onSetQueryParams: setQueryParams,
    }),
    [params, setQueryParams]
  );

  const {
    leaves,
    totalItems,
    totalPages,
    isLoading,
    isError,
    handleSearchChange,
    handleSort,
    handlePaginationChange,
    handleAdd,
    handleEdit,
    handleDetail,
    detailTarget,
    handleDetailClose,
    handleDetailEdit,
    formDrawerEditId,
    formDrawerOpen,
    handleFormDrawerClose,
    handleFormDrawerSuccess,
    cancelTarget,
    setCancelTarget,
    handleCancelClick,
    handleCancelConfirm,
  } = useLeavePage(pageOptions);

  const employeeFilterOptions = useMemo(() => {
    const seen = new Map<string, { value: string; label: string }>();

    leaves.forEach((item) => {
      if (!item.employeeId || seen.has(item.employeeId)) return;
      seen.set(item.employeeId, {
        value: item.employeeId,
        label: item.employee.fullName,
      });
    });

    return Array.from(seen.values());
  }, [leaves]);

  const yearFilterOptions = useMemo(() => {
    const seen = new Map<string, { value: string; label: string }>();

    leaves.forEach((item) => {
      const year = item.startDate.slice(0, 4);
      if (!year || seen.has(year)) return;
      seen.set(year, {
        value: year,
        label: year,
      });
    });

    return Array.from(seen.values()).sort((a, b) => b.value.localeCompare(a.value));
  }, [leaves]);

  const leaveTypeFilterOptions = useMemo(() => {
    const seen = new Map<string, { value: string; label: string }>();

    leaves.forEach((item) => {
      if (!item.leaveTypeId || seen.has(item.leaveTypeId)) return;
      seen.set(item.leaveTypeId, {
        value: item.leaveTypeId,
        label: item.leaveType.name,
      });
    });

    return Array.from(seen.values());
  }, [leaves]);

  const statusFilterOptions = useMemo(() => {
    const seen = new Map<string, { value: string; label: string }>();

    leaves.forEach((item) => {
      if (!item.status || seen.has(item.status)) return;
      seen.set(item.status, {
        value: item.status,
        label: LEAVE_STATUS_BADGE[item.status]?.label ?? item.status,
      });
    });

    return Array.from(seen.values());
  }, [leaves]);

  const handleFilterApply = useCallback(
    (values: Record<string, unknown>) => {
      const updates: Record<string, string | undefined> = { page: '1' };

      updates.employee = (values.employee as string | undefined) || undefined;
      updates.year = (values.year as string | undefined) || undefined;
      updates.status = (values.status as string | undefined) || undefined;
      updates.leaveType = (values.leaveType as string | undefined) || undefined;

      setQueryParams(updates as any);
    },
    [setQueryParams]
  );

  const columns = useMemo<ColumnDef<LeaveListItem>[]>(
    () => [
      {
        id: 'appliedDate',
        accessorKey: 'appliedDate',
        header: LEAVE_LABELS.LIST.COLUMNS.APPLIED_DATE,
        cell: ({ row }) => formatDate(row.original.appliedDate),
      },
      {
        id: 'employee.fullName',
        header: LEAVE_LABELS.LIST.COLUMNS.EMPLOYEE,
        cell: ({ row }) => (
          <button
            type="button"
            className="cursor-pointer text-slate-950 underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 rounded-sm"
            onClick={() => handleDetail(row.original)}
          >
            {row.original.employee.fullName}
          </button>
        ),
      },
      {
        id: 'leaveType.name',
        header: LEAVE_LABELS.LIST.COLUMNS.LEAVE_TYPE,
        cell: ({ row }) => row.original.leaveType.name,
      },
      {
        id: 'startDate',
        accessorKey: 'startDate',
        header: LEAVE_LABELS.LIST.COLUMNS.START_DATE,
        cell: ({ row }) => formatDate(row.original.startDate),
      },
      {
        id: 'endDate',
        accessorKey: 'endDate',
        header: LEAVE_LABELS.LIST.COLUMNS.END_DATE,
        cell: ({ row }) => formatDate(row.original.endDate),
      },
      {
        id: 'durationDays',
        accessorKey: 'durationDays',
        header: LEAVE_LABELS.LIST.COLUMNS.DURATION,
        cell: ({ row }) => `${row.original.durationDays} hari`,
      },
      {
        id: 'status',
        accessorKey: 'status',
        header: LEAVE_LABELS.LIST.COLUMNS.STATUS,
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        id: 'description',
        accessorKey: 'description',
        header: LEAVE_LABELS.LIST.COLUMNS.DESCRIPTION,
        cell: ({ row }) => row.original.description || '-',
      },
      {
        id: 'actions',
        header: LEAVE_LABELS.LIST.COLUMNS.ACTIONS,
        enableSorting: false,
        enableHiding: false,
        size: 60,
        cell: ({ row }) => (
          <LeaveActionsCell
            row={row.original}
            onView={handleDetail}
            onEdit={handleEdit}
            onCancel={handleCancelClick}
          />
        ),
      },
    ],
    [handleCancelClick, handleDetail, handleEdit]
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
        title={LEAVE_LABELS.LIST.TITLE}
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
              onClick={() => router.push(`/human-resource/leave/settings?companyId=${companyId}`)}
            >
              <Settings2 className="h-4 w-4" />
              {LEAVE_LABELS.BUTTONS.SETTING}
            </Button>
            <Button leftIcon={<Plus className="h-4 w-4" />} variant="default" onClick={handleAdd}>
              {LEAVE_LABELS.LIST.ADD_BUTTON}
            </Button>
          </div>
        }
        search={queryParams.search}
        onSearchChange={handleSearchChange}
        searchPlaceholder={LEAVE_LABELS.LIST.SEARCH}
        toolbarRight={
          <Button variant="outline" onClick={() => setDrawerOpen(true)} className="relative">
            {LEAVE_LABELS.LIST.FILTERS.FILTER}
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
            data={leaves}
            initialSorting={initialSorting}
            onSortingChange={handleSortingChange}
            initialPage={params.page}
            initialPageSize={params.perPage}
            onPaginationChange={handlePaginationChange}
            totalItems={totalItems}
            totalPages={totalPages}
            emptyMessage={LEAVE_LABELS.LIST.EMPTY}
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

      <LeaveFilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onApply={handleFilterApply}
        initialValues={filterValues}
        employeeOptions={employeeFilterOptions}
        yearOptions={yearFilterOptions}
        leaveTypeOptions={leaveTypeFilterOptions}
        statusOptions={statusFilterOptions}
      />

      <LeaveDetailDrawer
        open={detailTarget !== null}
        onClose={handleDetailClose}
        onEdit={handleDetailEdit}
        leaveId={detailTarget}
        companyId={companyId ?? null}
        onSuccess={handleFormDrawerSuccess}
      />

      <LeaveFormDrawer
        open={formDrawerOpen}
        onClose={handleFormDrawerClose}
        onSuccess={handleFormDrawerSuccess}
        editId={formDrawerEditId}
        companyId={companyId ?? null}
      />

      <ConfirmDialog
        open={cancelTarget !== null}
        onOpenChange={(value) => {
          if (!value) setCancelTarget(null);
        }}
        variant="danger"
        title={LEAVE_LABELS.DIALOG.CANCEL_TITLE}
        description={LEAVE_LABELS.DIALOG.CANCEL_DESCRIPTION}
        cancelText="Batal"
        confirmText="Ya, Batalkan"
        onCancel={() => setCancelTarget(null)}
        onConfirm={handleCancelConfirm}
      />
    </>
  );
}
