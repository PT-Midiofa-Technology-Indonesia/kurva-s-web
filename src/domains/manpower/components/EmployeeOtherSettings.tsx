'use client';

import { Settings } from 'lucide-react';

import type { TableColumn } from '@/components/atoms';
import { Button, Table } from '@/components/atoms';
import { Badge } from '@/components/ui/badge';
import { MANPOWER_LABELS } from '../constants';
import { useWorkPlacementEnums } from '../hooks/use-work-placement-enums';
import type { Employee } from '../types';

interface EmployeeOtherSettingsProps {
  employee: Employee;
  onSetting?: () => void;
}

export function EmployeeOtherSettings({ employee, onSetting }: EmployeeOtherSettingsProps) {
  const labels = MANPOWER_LABELS.DETAIL;
  const { workPlacements, contractTypes } = useWorkPlacementEnums();

  const workPlacementLabel = employee.workPlacement
    ? (workPlacements.find((opt) => opt.value === employee.workPlacement)?.label ??
      employee.workPlacement)
    : '-';

  const contractTypeLabel = employee.contractType
    ? (contractTypes.find((opt) => opt.value === employee.contractType)?.label ??
      employee.contractType)
    : '-';

  const columns: TableColumn[] = [
    {
      header: labels.OTHER_COLUMNS.ASSIGNMENT,
      renderCell: (value) => (value === '-' ? value : <Badge variant="secondary">{value}</Badge>),
    },
    {
      header: labels.OTHER_COLUMNS.CONTRACT_TYPE,
      renderCell: (value) => (value === '-' ? value : <Badge variant="secondary">{value}</Badge>),
    },
  ];

  const hasData = employee.contractType;
  const data = hasData ? [[workPlacementLabel, contractTypeLabel]] : [];

  return (
    <div className="rounded-[14px] border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
        <h2 className="text-base font-semibold text-slate-900">
          {labels.OTHER_SETTINGS_CARD_TITLE}
        </h2>
        <Button variant="outline" size="sm" onClick={onSetting} className="gap-1.5">
          <Settings className="h-3.5 w-3.5" />
          {labels.BUTTONS.SETTING}
        </Button>
      </div>

      <Table
        columns={columns}
        data={data}
        emptyMessage={labels.TABLE_EMPTY}
        containerClassName=""
      />
    </div>
  );
}
