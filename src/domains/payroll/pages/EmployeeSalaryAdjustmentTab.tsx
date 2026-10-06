'use client';

import { type ColumnDef } from '@tanstack/react-table';
import { EllipsisVertical, Pencil, Trash2 } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { AsyncSelect, Button } from '@/shared/components/atoms';
import { ConfirmDialog } from '@/shared/components/molecules/AlertDialog';
import { ListPageTemplate } from '@/shared/components/templates/ListPageTemplate';
import { Badge } from '@/shared/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { Separator } from '@/shared/components/ui/separator';
import { useCompanyFilter } from '@/shared/hooks/use-company-filter';
import { useQueryParams } from '@/shared/hooks/use-query-params';
import type { BaseQueryParams } from '@/types/query-params';
import { EmployeeSalaryAdjustmentDrawer } from '../components/EmployeeSalaryAdjustmentDrawer';
import { EmployeeSalaryAdjustmentFilterDrawer } from '../components/EmployeeSalaryAdjustmentFilterDrawer';
import { ADJUSTMENT_LABELS } from '../constants';
import { useDeleteEmployeeSalaryAdjustment } from '../hooks/use-delete-employee-salary-adjustment';
import { useEmployeeSalaryAdjustmentPage } from '../hooks/use-employee-salary-adjustment-page';
import { useSalaryStructureGrades } from '../hooks/use-salary-structure-grades';
import type { EmployeeSalaryAdjustment } from '../types';

interface TabUrlParams extends BaseQueryParams {
  tab?: string;
  gradeId?: string;
  hasAdjustment?: string;
}

function HasAdjustmentBadge({ hasAdjustment }: { hasAdjustment: boolean }) {
  return hasAdjustment ? (
    <Badge variant="success">Ya</Badge>
  ) : (
    <Badge variant="destructive">Tidak</Badge>
  );
}

export function EmployeeSalaryAdjustmentTab() {
  const { queryParams, updateQueryParam, setQueryParams } = useQueryParams<TabUrlParams>();

  const { companyId, companyOptions, handleCompanyChange } = useCompanyFilter();

  const [editTarget, setEditTarget] = useState<EmployeeSalaryAdjustment | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<EmployeeSalaryAdjustment | null>(null);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  const gradesParams = useMemo(() => ({ perPage: 100 }), []);
  const { data: gradesData } = useSalaryStructureGrades(gradesParams);
  const golonganOptions = useMemo(
    () => (gradesData?.data ?? []).map((grade) => ({ value: grade.id, label: grade.code })),
    [gradesData]
  );

  const filterInitialValues = useMemo(
    () => ({
      golongan: queryParams.gradeId ? queryParams.gradeId.split(',') : [],
      hasAdjustment: queryParams.hasAdjustment ? [queryParams.hasAdjustment] : [],
    }),
    [queryParams.gradeId, queryParams.hasAdjustment]
  );

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (queryParams.gradeId) count++;
    if (queryParams.hasAdjustment) count++;
    return count;
  }, [queryParams.gradeId, queryParams.hasAdjustment]);

  const handleFilterApply = useCallback(
    (values: Record<string, unknown>) => {
      const gradeIdSelected = Array.isArray(values.golongan) ? (values.golongan as string[]) : [];
      const hasAdjustmentSelected = Array.isArray(values.hasAdjustment)
        ? (values.hasAdjustment as string[])
        : [];

      setQueryParams({
        gradeId: gradeIdSelected.length > 0 ? gradeIdSelected.join(',') : undefined,
        hasAdjustment: hasAdjustmentSelected.length === 1 ? hasAdjustmentSelected[0] : undefined,
        page: '1',
      } as any);
    },
    [setQueryParams]
  );

  const params = useMemo(
    () => ({
      page: queryParams.page ?? 1,
      perPage: queryParams.perPage ?? 10,
      sortBy: queryParams.sortBy ?? 'fullName',
      sortOrder: (queryParams.sortOrder || 'asc') as 'asc' | 'desc',
      search: queryParams.search,
      gradeId: queryParams.gradeId ? queryParams.gradeId.split(',') : undefined,
      hasAdjustment:
        queryParams.hasAdjustment !== undefined ? queryParams.hasAdjustment === 'true' : undefined,
    }),
    [queryParams]
  );

  const pageOptions = useMemo(() => ({ params, companyId }), [params, companyId]);

  const { employees, totalItems, totalPages, isLoading, isError } =
    useEmployeeSalaryAdjustmentPage(pageOptions);

  const { mutate: deleteAdjustment, isPending: isDeleting } = useDeleteEmployeeSalaryAdjustment();

  // ── Handlers (own useQueryParams, not from hook) ──
  const handleSearchChange = useCallback(
    (value: string | undefined) => {
      setQueryParams({ search: value || undefined, page: '1' } as any);
    },
    [setQueryParams]
  );

  const handleSort = useCallback(
    (sortBy?: string, sortOrder?: string) => {
      if (sortBy) updateQueryParam('sortBy', sortBy);
      if (sortOrder) updateQueryParam('sortOrder', sortOrder);
    },
    [updateQueryParam]
  );

  const handlePaginationChange = useCallback(
    (page: number, perPage: number) => {
      setQueryParams({
        page: String(page),
        perPage: String(perPage),
      } as any);
    },
    [setQueryParams]
  );

  const handleEdit = useCallback((employee: EmployeeSalaryAdjustment) => {
    setEditTarget(employee);
  }, []);

  const handleEditClose = useCallback(() => {
    setEditTarget(null);
  }, []);

  const handleDeleteClick = useCallback((employee: EmployeeSalaryAdjustment) => {
    setDeleteTarget(employee);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (!deleteTarget) return;
    deleteAdjustment(
      { employeeId: deleteTarget.id, companyId },
      { onSuccess: () => setDeleteTarget(null) }
    );
  }, [deleteTarget, companyId, deleteAdjustment]);

  const columns = useMemo<ColumnDef<EmployeeSalaryAdjustment>[]>(
    () => [
      {
        accessorKey: 'fullName',
        header: ADJUSTMENT_LABELS.COLUMNS.NAME,
        size: 220,
      },
      {
        accessorKey: 'grade',
        header: ADJUSTMENT_LABELS.COLUMNS.GOLONGAN,
        size: 120,
        cell: ({ row }) => row.original.grade?.code || '-',
      },
      {
        accessorKey: 'salaryType',
        header: ADJUSTMENT_LABELS.COLUMNS.SALARY_TYPE,
        size: 150,
        cell: ({ row }) => {
          const { salaryType } = row.original;
          if (!salaryType) return '-';
          return salaryType.charAt(0).toUpperCase() + salaryType.slice(1);
        },
      },
      {
        accessorKey: 'hasAdjustment',
        header: ADJUSTMENT_LABELS.COLUMNS.HAS_ADJUSTMENT,
        size: 150,
        cell: ({ row }) => <HasAdjustmentBadge hasAdjustment={row.original.hasAdjustment} />,
      },
      {
        accessorKey: 'adjustmentCount',
        header: ADJUSTMENT_LABELS.COLUMNS.ADJUSTMENT_COUNT,
        size: 150,
        cell: ({ row }) => row.original.adjustmentCount,
      },
      {
        id: 'actions',
        header: ADJUSTMENT_LABELS.COLUMNS.ACTION,
        enableSorting: false,
        enableHiding: false,
        size: 60,
        cell: ({ row }) => {
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-6 w-6 p-0">
                  <EllipsisVertical className="h-4 w-4 text-slate-950" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleEdit(row.original)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  {ADJUSTMENT_LABELS.ACTIONS.EDIT}
                </DropdownMenuItem>
                {row.original.hasAdjustment && (
                  <>
                    <Separator className="flex-1 h-[0.05rem]" />
                    <DropdownMenuItem
                      onClick={() => handleDeleteClick(row.original)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {ADJUSTMENT_LABELS.ACTIONS.DELETE}
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [handleEdit, handleDeleteClick]
  );

  const filters = (
    <Button variant="outline" onClick={() => setFilterDrawerOpen(true)} className="relative">
      {ADJUSTMENT_LABELS.FILTER.BUTTON}
      {activeFilterCount > 0 && (
        <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-teal-600 rounded-full">
          {activeFilterCount}
        </span>
      )}
    </Button>
  );

  return (
    <>
      <ListPageTemplate<EmployeeSalaryAdjustment>
        title={ADJUSTMENT_LABELS.TITLE}
        headerActions={
          <AsyncSelect
            className="w-52"
            options={companyOptions}
            value={companyId ?? ''}
            onChange={handleCompanyChange}
            placeholder="Company"
            isSearchable={false}
            isClearable={false}
          />
        }
        data={employees}
        columns={columns}
        isLoading={isLoading}
        isError={isError}
        emptyMessage={ADJUSTMENT_LABELS.EMPTY}
        search={queryParams.search}
        searchPlaceholder={ADJUSTMENT_LABELS.SEARCH}
        onSearchChange={handleSearchChange}
        toolbarRight={filters}
        sortBy={params.sortBy}
        sortOrder={params.sortOrder}
        onSort={handleSort}
        page={params.page}
        perPage={params.perPage}
        totalItems={totalItems}
        totalPages={totalPages}
        onPaginationChange={handlePaginationChange}
      />

      <EmployeeSalaryAdjustmentDrawer
        open={editTarget !== null}
        onClose={handleEditClose}
        employee={editTarget}
        companyId={companyId}
      />

      <EmployeeSalaryAdjustmentFilterDrawer
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        onApply={handleFilterApply}
        initialValues={filterInitialValues}
        golonganOptions={golonganOptions}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        variant="danger"
        title={ADJUSTMENT_LABELS.DIALOG.DELETE_TITLE}
        description={ADJUSTMENT_LABELS.DIALOG.DELETE_DESCRIPTION}
        cancelText="Batal"
        confirmText="Hapus"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
      />
    </>
  );
}
