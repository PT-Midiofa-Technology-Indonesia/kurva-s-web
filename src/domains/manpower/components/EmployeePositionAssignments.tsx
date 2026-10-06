'use client';

import { Settings } from 'lucide-react';
import type { TableColumn } from '@/components/atoms';
import { Button, Table } from '@/components/atoms';
import { Switch } from '@/shared/components/ui/switch';
import { toast } from '@/shared/lib/toast';
import { MANPOWER_LABELS } from '../constants';
import { useSetPrimaryPositionAssignment } from '../hooks/use-set-primary-position-assignment';
import type { PositionAssignment } from '../types';

interface EmployeePositionAssignmentsProps {
  assignments: PositionAssignment[];
  isLoading?: boolean;
  employeeId?: string;
  onSetting?: () => void;
}

export function EmployeePositionAssignments({
  assignments,
  isLoading,
  employeeId,
  onSetting,
}: EmployeePositionAssignmentsProps) {
  const labels = MANPOWER_LABELS.DETAIL;
  const { mutate: setPrimary, isPending } = useSetPrimaryPositionAssignment(employeeId ?? '');

  const handlePrimaryToggle = (companyId: string) => {
    setPrimary(companyId, {
      onSuccess: () => {
        toast.success({ title: 'Default company berhasil diubah' });
      },
      onError: () => {
        toast.error({ title: 'Gagal mengubah default company' });
      },
    });
  };

  const columns: TableColumn[] = [
    { header: labels.POSITION_COLUMNS.COMPANY },
    { header: labels.POSITION_COLUMNS.JOB_POSITION },
    { header: labels.POSITION_COLUMNS.DEFAULT, className: 'w-20 text-center' },
  ];

  const data = assignments.map((assignment) => [
    <span
      key={`${assignment.id}-company`}
      className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700"
    >
      {assignment.company.name}
    </span>,
    <span
      key={`${assignment.id}-position`}
      className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700"
    >
      {assignment.companyPosition?.position?.name ?? '-'}
    </span>,
    <div key={`${assignment.id}-primary`} className="flex justify-center">
      <Switch
        checked={assignment.companyEmployee?.isPrimary ?? false}
        disabled={isPending || !employeeId}
        onCheckedChange={() => handlePrimaryToggle(assignment.companyId)}
        className="data-[state=checked]:bg-brand-600"
      />
    </div>,
  ]);

  return (
    <div className="rounded-[14px] border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
        <h2 className="text-base font-semibold text-slate-900">{labels.POSITION_CARD_TITLE}</h2>
        <Button variant="outline" size="sm" onClick={onSetting} className="gap-1.5">
          <Settings className="h-3.5 w-3.5" />
          {labels.BUTTONS.SETTING}
        </Button>
      </div>

      <Table
        columns={columns}
        data={data}
        emptyMessage={labels.TABLE_EMPTY}
        isLoading={isLoading}
        containerClassName=""
      />
    </div>
  );
}
