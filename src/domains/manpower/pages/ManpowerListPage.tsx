'use client';

import type { ColumnDef, Row } from '@tanstack/react-table';
import { Eye, MoreHorizontal, Pencil, PlusIcon, Trash2 } from 'lucide-react';
import { useCallback, useMemo } from 'react';
import { useQueryParams } from '@/hooks/use-query-params';
import { AsyncSelect, Button } from '@/shared/components/atoms';
import { ConfirmDialog } from '@/shared/components/molecules/AlertDialog';
import { ListPageTemplate } from '@/shared/components/templates/ListPageTemplate';
import { Badge } from '@/shared/components/ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { useCompanyFilter } from '@/shared/hooks/use-company-filter';
import { useEmployeeTypes } from '@/shared/hooks/use-enums';
import type { BaseQueryParams } from '@/types/query-params';
import { MANPOWER_LABELS, STATUS_OPTIONS } from '../constants';
import { useEmployeePage } from '../hooks/use-employee-page';
import { EMPLOYEE_TYPE_LABELS, type Employee, GENDER_LABELS } from '../types';

interface EmployeeUrlParams extends BaseQueryParams {
  companyId?: string;
  isActive?: string;
  employeeType?: string;
}

function EmployeeActionsCell({
  row,
  onDetail,
  onEdit,
  onDeleteClick,
}: {
  row: Row<Employee>;
  onDetail?: (r: Employee) => void;
  onEdit?: (r: Employee) => void;
  onDeleteClick: (r: Employee) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-6 w-6 p-0">
          <MoreHorizontal className="h-4 w-4 text-slate-950" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onEdit?.(row.original)}>
          <Pencil className="mr-2 h-4 w-4" />
          {MANPOWER_LABELS.LIST.ACTIONS.EDIT}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onDetail?.(row.original)}>
          <Eye className="mr-2 h-4 w-4" />
          {MANPOWER_LABELS.LIST.ACTIONS.DETAIL}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onDeleteClick(row.original)}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          {MANPOWER_LABELS.LIST.ACTIONS.DELETE}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function ManpowerListPage() {
  const { queryParams, updateQueryParam, setQueryParams } = useQueryParams<EmployeeUrlParams>();

  const { companyId, companyOptions, handleCompanyChange } = useCompanyFilter();

  // ── Table params ─────────────────────────────────────────────────────────

  const params = useMemo(() => {
    const isActive =
      queryParams.isActive === 'true' ? true : queryParams.isActive === 'false' ? false : undefined;

    return {
      page: queryParams.page ?? 1,
      perPage: queryParams.perPage ?? 10,
      sortBy: queryParams.sortBy ?? 'fullName',
      sortOrder: (queryParams.sortOrder || 'asc') as 'asc' | 'desc',
      search: queryParams.search,
      isActive,
      employeeType: queryParams.employeeType,
      companyId,
    };
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
    employees,
    totalItems,
    totalPages,
    isLoading,
    isFetching,
    isError,
    isDeleting,
    handleAdd,
    handleEdit,
    handleDetail,
    deleteTarget,
    setDeleteTarget,
    handleDeleteClick,
    handleDeleteConfirm,
    handleSearchChange,
    handleSort,
    handlePaginationChange,
  } = useEmployeePage(pageOptions);

  const handleIsActiveChange = useCallback(
    (value: string | string[] | null | undefined) => {
      const v = Array.isArray(value) ? value[0] : value;
      updateQueryParam('isActive', v || undefined);
    },
    [updateQueryParam]
  );

  const handleEmployeeTypeChange = useCallback(
    (value: string | string[] | null | undefined) => {
      const v = Array.isArray(value) ? value[0] : value;
      updateQueryParam('employeeType', v || undefined);
    },
    [updateQueryParam]
  );

  const columns = useMemo<ColumnDef<Employee>[]>(
    () => [
      {
        accessorKey: 'fullName',
        header: MANPOWER_LABELS.LIST.COLUMNS.FULL_NAME,
        size: 180,
      },
      {
        accessorKey: 'gender',
        header: MANPOWER_LABELS.LIST.COLUMNS.GENDER,
        size: 120,
        cell: ({ row }) => (
          <>
            {GENDER_LABELS[row.original.gender as keyof typeof GENDER_LABELS] ??
              row.original.gender}
          </>
        ),
      },
      {
        accessorKey: 'employeeType',
        header: MANPOWER_LABELS.LIST.COLUMNS.EMPLOYEE_TYPE,
        size: 140,
        cell: ({ row }) => (
          <Badge variant="secondary">
            {EMPLOYEE_TYPE_LABELS[row.original.employeeType as keyof typeof EMPLOYEE_TYPE_LABELS] ??
              row.original.employeeType}
          </Badge>
        ),
      },
      {
        accessorKey: 'status',
        header: MANPOWER_LABELS.LIST.COLUMNS.STATUS,
        size: 100,
        cell: ({ row }) =>
          row.original.isActive ? (
            <Badge variant="success">{MANPOWER_LABELS.LIST.STATUS.ACTIVE}</Badge>
          ) : (
            <Badge variant="destructive">{MANPOWER_LABELS.LIST.STATUS.INACTIVE}</Badge>
          ),
      },
      {
        id: 'actions',
        header: MANPOWER_LABELS.LIST.COLUMNS.ACTIONS,
        enableSorting: false,
        enableHiding: false,
        size: 80,
        cell: ({ row }) => (
          <EmployeeActionsCell
            row={row}
            onDetail={handleDetail}
            onEdit={handleEdit}
            onDeleteClick={handleDeleteClick}
          />
        ),
      },
    ],
    [handleDeleteClick, handleDetail, handleEdit]
  );

  const { data: employeeTypeOptions } = useEmployeeTypes();

  const employeeTypeFilterOptions = employeeTypeOptions ?? [
    { label: 'No options available', value: '' },
  ];

  const filters = (
    <div className="flex gap-3 flex-wrap">
      <AsyncSelect
        className="w-44"
        options={employeeTypeFilterOptions}
        placeholder="Semua Tipe Karyawan"
        aria-label="Filter Tipe Karyawan"
        isSearchable={false}
        onChange={handleEmployeeTypeChange}
      />
      <AsyncSelect
        className="w-40"
        options={STATUS_OPTIONS}
        placeholder="Semua Status"
        aria-label="Filter Status"
        isSearchable={false}
        onChange={handleIsActiveChange}
      />
    </div>
  );

  return (
    <>
      <ListPageTemplate<Employee>
        title={MANPOWER_LABELS.LIST.TITLE}
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
            <Button onClick={handleAdd} leftIcon={<PlusIcon />}>
              {MANPOWER_LABELS.LIST.ADD_BUTTON}
            </Button>
          </div>
        }
        data={employees}
        columns={columns}
        isLoading={isLoading || isFetching}
        isError={isError}
        emptyMessage={MANPOWER_LABELS.LIST.EMPTY}
        search={queryParams.search}
        onSearchChange={handleSearchChange}
        sortBy={params.sortBy}
        sortOrder={params.sortOrder}
        onSort={handleSort}
        page={params.page}
        perPage={params.perPage}
        totalItems={totalItems}
        totalPages={totalPages}
        onPaginationChange={handlePaginationChange}
        toolbarRight={filters}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        variant="danger"
        title={MANPOWER_LABELS.DIALOG.DELETE_TITLE}
        description={MANPOWER_LABELS.DIALOG.DELETE_DESCRIPTION}
        cancelText={MANPOWER_LABELS.DIALOG.DELETE_CANCEL}
        confirmText={MANPOWER_LABELS.DIALOG.DELETE_CONFIRM}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
      />
    </>
  );
}
