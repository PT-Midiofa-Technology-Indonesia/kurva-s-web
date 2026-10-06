'use client';

import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { EllipsisVertical, Eye, Pencil, Plus, Trash2 } from 'lucide-react';
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
import { AttendanceDetailDrawer } from '../components/AttendanceDetailDrawer';
import { AttendanceFilterDrawer } from '../components/AttendanceFilterDrawer';
import { BulkInputModal } from '../components/BulkInputModal';
import { ATTENDANCE_LABELS } from '../constants';
import { useAttendancePage } from '../hooks/use-attendance-page';
import type { AttendanceListItem } from '../types';

interface AttendanceUrlParams extends BaseQueryParams {
  companyId?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  employeeIds?: string;
  projectIds?: string;
  locationType?: string;
  locationId?: string;
}

function AttendanceActionsCell({
  onView,
  onEdit,
  onDeleteClick,
}: {
  onView?: () => void;
  onEdit?: () => void;
  onDeleteClick?: () => void;
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
          {ATTENDANCE_LABELS.ACTIONS.VIEW}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onEdit}>
          <Pencil className="mr-2 h-4 w-4" />
          {ATTENDANCE_LABELS.ACTIONS.EDIT}
        </DropdownMenuItem>
        <Separator className="flex-1 h-[0.05rem]" />
        <DropdownMenuItem
          onClick={onDeleteClick}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          {ATTENDANCE_LABELS.ACTIONS.DELETE}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusMap: Record<
    string,
    { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
  > = {
    present: { label: 'Present', variant: 'secondary' },
    late: { label: 'Late', variant: 'destructive' },
    absent: { label: 'Absent', variant: 'destructive' },
    sick: { label: 'Sick', variant: 'secondary' },
    leave: { label: 'Leave', variant: 'secondary' },
    dayoff: { label: 'Day Off', variant: 'secondary' },
    halfday: { label: 'Half Day', variant: 'secondary' },
  };
  const config = statusMap[status] ?? { label: status, variant: 'secondary' as const };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

function CheckInDisplay({ time, status }: { time: string; status: string }) {
  if (time === '00:00') return <span className="text-red-500">00:00</span>;
  if (status === 'late') return <span className="text-red-500">{time}</span>;
  return <span className="text-green-600">{time}</span>;
}

function CheckOutDisplay({ time }: { time: string }) {
  if (time === '00:00') return <span className="text-red-500">00:00</span>;
  return <span className="text-green-600">{time}</span>;
}

export function AttendanceListPage() {
  const { queryParams, updateQueryParam, setQueryParams } = useQueryParams<AttendanceUrlParams>();

  const { companyId, companyOptions, handleCompanyChange } = useCompanyFilter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);

  // ── Active filter count for badge ────────────────────────────────────────
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (queryParams.startDate || queryParams.endDate) count++;
    if (queryParams.status) count++;
    if (queryParams.employeeIds) count++;
    if (queryParams.projectIds) count++;
    if (queryParams.locationType || queryParams.locationId) count++;
    return count;
  }, [queryParams]);

  // ── Parse filter values from URL ─────────────────────────────────────────

  const filterValues = useMemo(() => {
    const vals: Record<string, unknown> = {};
    if (queryParams.startDate || queryParams.endDate) {
      vals.dateRange = {
        startDate: queryParams.startDate ?? '',
        endDate: queryParams.endDate ?? '',
      };
    }
    if (queryParams.status) {
      vals.status = queryParams.status.split(',');
    }
    if (queryParams.employeeIds) {
      vals.employee = queryParams.employeeIds.split(',');
    }
    if (queryParams.projectIds) {
      vals.project = queryParams.projectIds.split(',');
    }
    if (queryParams.locationType && queryParams.locationId) {
      vals.location = {
        locationType: queryParams.locationType,
        locationId: queryParams.locationId,
      };
    }
    return vals;
  }, [queryParams]);

  // ── Table params ─────────────────────────────────────────────────────────

  const params = useMemo(() => {
    const p: Record<string, any> = {
      page: queryParams.page ?? 1,
      perPage: queryParams.perPage ?? 10,
      sortBy: queryParams.sortBy ?? 'attendanceDate',
      sortOrder: (queryParams.sortOrder || 'desc') as 'asc' | 'desc',
      search: queryParams.search,
      companyId,
    };
    if (queryParams.startDate) p.startDate = queryParams.startDate;
    if (queryParams.endDate) p.endDate = queryParams.endDate;
    if (queryParams.status) p.status = queryParams.status.split(',');
    if (queryParams.employeeIds) p.employeeIds = queryParams.employeeIds.split(',');
    if (queryParams.projectIds) p.projectIds = queryParams.projectIds.split(',');
    if (queryParams.locationType) p.locationType = queryParams.locationType;
    if (queryParams.locationId) p.locationId = queryParams.locationId;
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
    attendances,
    totalItems,
    totalPages,
    isLoading,
    isError,
    handleSearchChange,
    handleSort,
    handlePaginationChange,
    detailTarget,
    editTarget,
    handleDetail,
    handleEdit,
    handleDetailClose,
    handleEditClose,
    handleDetailSuccess,
    deleteTarget,
    setDeleteTarget,
    handleDeleteClick,
    handleDeleteConfirm,
  } = useAttendancePage(pageOptions);

  // ── Filter apply handler ─────────────────────────────────────────────────

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
      if (vals.status && Array.isArray(vals.status) && vals.status.length > 0) {
        updates.status = (vals.status as string[]).join(',');
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
      if (vals.location) {
        const loc = vals.location as { locationType: string; locationId: string };
        updates.locationType = loc.locationType || undefined;
        updates.locationId = loc.locationId || undefined;
      } else {
        updates.locationType = undefined;
        updates.locationId = undefined;
      }
      setQueryParams(updates as any);
    },
    [setQueryParams]
  );

  // ── Columns ──────────────────────────────────────────────────────────────

  const columns = useMemo<ColumnDef<AttendanceListItem>[]>(
    () => [
      {
        id: 'attendanceDate',
        accessorKey: 'attendanceDate',
        header: ATTENDANCE_LABELS.LIST.COLUMNS.DATE,
        cell: ({ row }) => formatDate(row.original.attendanceDate),
      },
      {
        id: 'employee.code',
        header: ATTENDANCE_LABELS.LIST.COLUMNS.CODE,
        cell: ({ row }) => (
          <span>{row.original.employee?.code || row.original.employeeCode || '-'}</span>
        ),
      },
      {
        id: 'employee.fullName',
        header: ATTENDANCE_LABELS.LIST.COLUMNS.NAME,
        cell: ({ row }) => (
          <span>{row.original.employee?.fullName || row.original.employeeName || '-'}</span>
        ),
      },
      {
        accessorKey: 'checkIn',
        header: ATTENDANCE_LABELS.LIST.COLUMNS.CHECK_IN,
        cell: ({ row }) => (
          <CheckInDisplay time={row.original.checkIn ?? ''} status={row.original.status} />
        ),
      },
      {
        accessorKey: 'checkOut',
        header: ATTENDANCE_LABELS.LIST.COLUMNS.CHECK_OUT,
        cell: ({ row }) => <CheckOutDisplay time={row.original.checkOut ?? ''} />,
      },
      {
        id: 'location',
        header: ATTENDANCE_LABELS.LIST.COLUMNS.LOCATION,
        cell: ({ row }) =>
          row.original.location?.name ||
          row.original.locationName ||
          row.original.locationType ||
          '-',
      },
      {
        id: 'project',
        header: ATTENDANCE_LABELS.LIST.COLUMNS.PROJECT,
        cell: ({ row }) => row.original.project?.name || row.original.projectName || '-',
      },
      {
        accessorKey: 'status',
        header: ATTENDANCE_LABELS.LIST.COLUMNS.STATUS,
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        id: 'actions',
        header: ATTENDANCE_LABELS.LIST.COLUMNS.ACTIONS,
        enableSorting: false,
        enableHiding: false,
        size: 60,
        cell: ({ row }) => (
          <AttendanceActionsCell
            onView={() => handleDetail(row.original)}
            onEdit={() => handleEdit(row.original)}
            onDeleteClick={() => handleDeleteClick(row.original)}
          />
        ),
      },
    ],
    [handleDetail, handleEdit, handleDeleteClick]
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
        title={ATTENDANCE_LABELS.LIST.TITLE}
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
              onClick={() => setBulkModalOpen(true)}
            >
              {ATTENDANCE_LABELS.LIST.ADD_BUTTON}
            </Button>
          </div>
        }
        search={queryParams.search}
        onSearchChange={handleSearchChange}
        searchPlaceholder={ATTENDANCE_LABELS.LIST.SEARCH}
        toolbarRight={
          <Button variant="outline" onClick={() => setDrawerOpen(true)} className="relative">
            {ATTENDANCE_LABELS.LIST.FILTERS.FILTER}
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
            data={attendances}
            initialSorting={initialSorting}
            onSortingChange={handleSortingChange}
            initialPage={params.page}
            initialPageSize={params.perPage}
            onPaginationChange={handlePaginationChange}
            totalItems={totalItems}
            totalPages={totalPages}
            emptyMessage={ATTENDANCE_LABELS.LIST.EMPTY}
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

      <AttendanceFilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onApply={handleFilterApply}
        initialValues={filterValues}
        companyId={companyId}
      />

      <AttendanceDetailDrawer
        open={detailTarget !== null}
        onClose={handleDetailClose}
        id={detailTarget}
        companyId={companyId}
        onSuccess={handleDetailSuccess}
      />

      <AttendanceDetailDrawer
        open={editTarget !== null}
        onClose={handleEditClose}
        id={editTarget}
        companyId={companyId}
        defaultEditing
        onSuccess={handleDetailSuccess}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        variant="danger"
        title={ATTENDANCE_LABELS.DIALOG.DELETE_TITLE}
        description={ATTENDANCE_LABELS.DIALOG.DELETE_DESCRIPTION}
        cancelText="Batal"
        confirmText="Ya, Hapus"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />

      <BulkInputModal
        open={bulkModalOpen}
        onClose={() => setBulkModalOpen(false)}
        companyId={companyId}
      />
    </>
  );
}
