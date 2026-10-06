'use client';

import { EllipsisVertical, Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/atoms';
import { DataTable } from '@/components/organisms/DataTable';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { ConfirmDialog } from '@/shared/components/molecules/AlertDialog';
import { MANPOWER_LABELS } from '../constants';
import { useDeleteEmployeeSkill } from '../hooks/use-delete-employee-skill';
import { useEmployeeSkills } from '../hooks/use-employee-skills';
import type { EmployeeSkill } from '../types';
import { EmployeeSkillDetailDrawer } from './EmployeeSkillDetailDrawer';
import { EmployeeSkillFormDrawer } from './EmployeeSkillFormDrawer';

const LABELS = MANPOWER_LABELS.SKILL_SETTINGS;

interface EmployeeSkillSettingsProps {
  employeeId: string;
  companyId?: string;
}

export function EmployeeSkillSettings({ employeeId, companyId }: EmployeeSkillSettingsProps) {
  const { data, isLoading } = useEmployeeSkills(employeeId, { perPage: 100 });
  const skills = data?.data ?? [];

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<EmployeeSkill | null>(null);
  const [detailTarget, setDetailTarget] = useState<EmployeeSkill | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<EmployeeSkill | null>(null);
  const { mutate: deleteSkill, isPending: isDeleting } = useDeleteEmployeeSkill(
    employeeId,
    companyId
  );

  const columns: import('@tanstack/react-table').ColumnDef<EmployeeSkill>[] = [
    {
      id: 'code',
      header: LABELS.COLUMNS.CODE,
      accessorKey: 'code',
      cell: ({ row }) => (
        <span className="text-sm font-medium text-slate-900">{row.original.skillCatalog.code}</span>
      ),
      enableSorting: false,
    },
    {
      id: 'name',
      header: LABELS.COLUMNS.SKILL,
      accessorKey: 'name',
      cell: ({ row }) => (
        <span className="text-sm text-slate-700">{row.original.skillCatalog.name}</span>
      ),
      enableSorting: false,
    },
    {
      id: 'level',
      header: LABELS.COLUMNS.LEVEL,
      cell: ({ row }) => (
        <span className="text-sm text-slate-700">{row.original.skillCatalog.skillLevel.name}</span>
      ),
      enableSorting: false,
    },
    {
      id: 'category',
      header: LABELS.COLUMNS.CATEGORY,
      cell: ({ row }) => (
        <span className="text-sm text-slate-700">
          {row.original.skillCatalog.skillCategory.name}
        </span>
      ),
      enableSorting: false,
    },
    {
      id: 'status',
      header: LABELS.COLUMNS.STATUS,
      cell: ({ row }) =>
        row.original.isActive ? (
          <Badge variant="success">{LABELS.STATUS_ACTIVE}</Badge>
        ) : (
          <Badge variant="destructive">{LABELS.STATUS_INACTIVE}</Badge>
        ),
      enableSorting: false,
    },
    {
      id: 'actions',
      header: LABELS.COLUMNS.ACTIONS,
      size: 60,
      cell: ({ row }) => {
        const skill = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-6 w-6 p-0">
                <EllipsisVertical className="h-4 w-4 text-slate-950" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  setEditTarget(skill);
                  setFormOpen(true);
                }}
              >
                <Pencil className="mr-2 h-4 w-4" />
                {LABELS.ACTION_EDIT}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDetailTarget(skill)}>
                <Eye className="mr-2 h-4 w-4" />
                {LABELS.ACTION_DETAIL}
              </DropdownMenuItem>
              <Separator className="flex-1 h-[0.05rem]" />
              <DropdownMenuItem
                onClick={() => setDeleteTarget(skill)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {LABELS.ACTION_DELETE}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
      enableSorting: false,
    },
  ];

  return (
    <>
      <div className="rounded-[14px] border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-slate-900">{LABELS.TITLE}</h2>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setEditTarget(null);
              setFormOpen(true);
            }}
            className="gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            {LABELS.BUTTON_ADD}
          </Button>
        </div>

        <DataTable
          data={skills}
          columns={columns}
          isLoading={isLoading}
          enablePagination={false}
          enableColumnDnd={false}
          enableColumnResize={false}
          enableRowSelection={false}
          enableZebraStripes={false}
          emptyMessage={LABELS.EMPTY}
          className="shadow-none rounded-none"
        />
      </div>

      <EmployeeSkillFormDrawer
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditTarget(null);
        }}
        employeeId={employeeId}
        companyId={companyId}
        editTarget={editTarget}
        onSuccess={() => {
          setFormOpen(false);
          setEditTarget(null);
        }}
      />

      <EmployeeSkillDetailDrawer
        open={detailTarget !== null}
        onClose={() => setDetailTarget(null)}
        onEdit={() => {
          const target = detailTarget;
          setDetailTarget(null);
          if (target) {
            setEditTarget(target);
            setFormOpen(true);
          }
        }}
        employeeId={employeeId}
        skill={detailTarget}
        onSuccess={() => setDetailTarget(null)}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        variant="danger"
        title={LABELS.DELETE_TITLE}
        description={LABELS.DELETE_DESCRIPTION}
        cancelText={LABELS.DELETE_CANCEL}
        confirmText={LABELS.DELETE_CONFIRM}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteSkill(deleteTarget.id, {
            onSuccess: () => setDeleteTarget(null),
          });
        }}
        isLoading={isDeleting}
      />
    </>
  );
}
