'use client';

import { type ColumnDef } from '@tanstack/react-table';
import { EllipsisVertical, Pencil } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { Button } from '@/shared/components/atoms';
import { ListPageTemplate } from '@/shared/components/templates/ListPageTemplate';
import { Badge } from '@/shared/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { useQueryParams } from '@/shared/hooks/use-query-params';
import type { BaseQueryParams } from '@/types/query-params';
import { SalaryStructureFormDrawer } from '../components/SalaryStructureFormDrawer';
import { COMPLETENESS_BADGE, PAYROLL_LABELS } from '../constants';
import { useSalaryStructurePage } from '../hooks/use-salary-structure-page';
import type { SalaryStructureGrade } from '../types';

interface TabUrlParams extends BaseQueryParams {
  tab?: string;
}

function CompletenessBadge({ status }: { status: string }) {
  const badge = COMPLETENESS_BADGE[status] ?? {
    className: '',
    label: status,
  };
  return <Badge className={badge.className}>{badge.label}</Badge>;
}

export function SalaryStructureTab() {
  const { queryParams, updateQueryParam, setQueryParams } = useQueryParams<TabUrlParams>();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editGradeId, setEditGradeId] = useState<string | null>(null);
  const [editGradeCode, setEditGradeCode] = useState('');

  const params = useMemo(
    () => ({
      page: queryParams.page ?? 1,
      perPage: queryParams.perPage ?? 10,
      sortBy: queryParams.sortBy ?? 'code',
      sortOrder: (queryParams.sortOrder || 'asc') as 'asc' | 'desc',
      search: queryParams.search,
    }),
    [queryParams]
  );

  const pageOptions = useMemo(() => ({ params }), [params]);

  const { grades, totalItems, totalPages, isLoading, isError } =
    useSalaryStructurePage(pageOptions);

  // ── Handlers (own useQueryParams, not hook) ──
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

  // ── Edit handlers ──
  const handleEdit = useCallback((grade: SalaryStructureGrade) => {
    setEditGradeId(grade.id);
    setEditGradeCode(`${grade.code} - ${grade.name}`);
    setDrawerOpen(true);
  }, []);

  const handleFormDrawerClose = useCallback(() => {
    setDrawerOpen(false);
    setEditGradeId(null);
    setEditGradeCode('');
  }, []);

  // ── Columns ──
  const columns = useMemo<ColumnDef<SalaryStructureGrade>[]>(
    () => [
      {
        accessorKey: 'code',
        header: PAYROLL_LABELS.SALARY_STRUCTURE.COLUMNS.GRADE,
        size: 100,
      },
      {
        accessorKey: 'name',
        header: PAYROLL_LABELS.SALARY_STRUCTURE.COLUMNS.NAME,
        size: 250,
      },
      {
        id: 'monthly',
        header: PAYROLL_LABELS.SALARY_STRUCTURE.COLUMNS.MONTHLY,
        size: 120,
        cell: ({ row }) => <CompletenessBadge status={row.original.completeness.monthly} />,
      },
      {
        id: 'daily',
        header: PAYROLL_LABELS.SALARY_STRUCTURE.COLUMNS.DAILY,
        size: 100,
        cell: ({ row }) => <CompletenessBadge status={row.original.completeness.daily} />,
      },
      {
        id: 'hourly',
        header: PAYROLL_LABELS.SALARY_STRUCTURE.COLUMNS.HOURLY,
        size: 100,
        cell: ({ row }) => <CompletenessBadge status={row.original.completeness.hourly} />,
      },
      {
        id: 'actions',
        header: PAYROLL_LABELS.SALARY_STRUCTURE.COLUMNS.ACTION,
        enableSorting: false,
        enableHiding: false,
        size: 60,
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-6 w-6 p-0">
                <EllipsisVertical className="h-4 w-4 text-slate-950" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleEdit(row.original)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [handleEdit]
  );

  return (
    <>
      <ListPageTemplate<SalaryStructureGrade>
        title={PAYROLL_LABELS.SALARY_STRUCTURE.TITLE}
        data={grades}
        columns={columns}
        isLoading={isLoading}
        isError={isError}
        emptyMessage={PAYROLL_LABELS.SALARY_STRUCTURE.EMPTY}
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
      />

      <SalaryStructureFormDrawer
        open={drawerOpen}
        onClose={handleFormDrawerClose}
        onSuccess={handleFormDrawerClose}
        gradeId={editGradeId}
        gradeCode={editGradeCode}
      />
    </>
  );
}
