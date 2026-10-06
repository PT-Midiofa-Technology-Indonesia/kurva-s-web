'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/atoms';
import { ConfirmDialog } from '@/shared/components/molecules/AlertDialog';
import { DataTable } from '@/shared/components/organisms/DataTable';
import { COMPANY_LABELS } from '../constants';
import { useDeleteCompanyDepartment } from '../hooks/use-delete-company-department';
import type { CompanyDepartment } from '../types';

interface CompanyDepartmentsProps {
  companyId: string;
  departments: CompanyDepartment[];
  onAdd: () => void;
}

export function CompanyDepartments({ companyId, departments, onAdd }: CompanyDepartmentsProps) {
  const { mutate: deleteDepartment } = useDeleteCompanyDepartment(companyId);
  const [deleteTarget, setDeleteTarget] = useState<CompanyDepartment | null>(null);

  const columns = useMemo<ColumnDef<CompanyDepartment>[]>(
    () => [
      {
        accessorKey: 'code',
        header: COMPANY_LABELS.DETAIL.DEPARTMENT_COLUMNS.CODE,
        size: 120,
      },
      {
        accessorKey: 'name',
        header: COMPANY_LABELS.DETAIL.DEPARTMENT_COLUMNS.NAME,
        size: 300,
      },
      {
        id: 'actions',
        header: COMPANY_LABELS.DETAIL.DEPARTMENT_COLUMNS.ACTION,
        enableSorting: false,
        enableHiding: false,
        size: 80,
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            onClick={() => setDeleteTarget(row.original)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        ),
      },
    ],
    []
  );

  return (
    <div className="rounded-lg border bg-white p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-900">
          {COMPANY_LABELS.DETAIL.DEPARTMENT_CARD_TITLE}
        </h2>
        <Button variant="outline" size="sm" onClick={onAdd} className="gap-1">
          <span className="text-sm">+</span>
          {COMPANY_LABELS.DETAIL.ADD_DEPARTMENT}
        </Button>
      </div>

      <DataTable
        data={departments}
        columns={columns}
        enablePagination={false}
        enableColumnDnd={false}
        enableColumnResize={false}
        emptyMessage={COMPANY_LABELS.DETAIL.EMPTY_DEPARTMENT}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        variant="danger"
        title={COMPANY_LABELS.DETAIL.DIALOG.DELETE_DEPARTMENT_TITLE}
        description={COMPANY_LABELS.DETAIL.DIALOG.DELETE_DEPARTMENT_DESCRIPTION}
        cancelText={COMPANY_LABELS.ADD_DEPARTMENT.CANCEL}
        confirmText={COMPANY_LABELS.ADD_DEPARTMENT.SAVE}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteDepartment(deleteTarget.id, {
            onSuccess: () => setDeleteTarget(null),
          });
        }}
      />
    </div>
  );
}
