'use client';

import { Settings } from 'lucide-react';

import type { TableColumn } from '@/components/atoms';
import { Button, Table } from '@/components/atoms';
import { Badge } from '@/components/ui/badge';
import { useSalaryTypes } from '@/shared/hooks/use-enums';
import { MANPOWER_LABELS } from '../constants';
import type { Employee } from '../types';

interface EmployeePayrollSettingsProps {
  employee: Employee;
  onSetting?: () => void;
}

export function EmployeePayrollSettings({ employee, onSetting }: EmployeePayrollSettingsProps) {
  const labels = MANPOWER_LABELS.DETAIL;
  const { data: salaryTypes = [] } = useSalaryTypes();

  const employeeGrade = employee.employeeGrade ?? employee.grade;
  const gradeLabel = employeeGrade ? `${employeeGrade.code} - ${employeeGrade.name}` : '-';

  const salaryTypeLabel = employee.salaryType
    ? (salaryTypes.find((opt) => opt.value === employee.salaryType)?.label ?? employee.salaryType)
    : '-';
  const bankName = employee.bankName ?? '-';
  const accountNumber = employee.accountNumber ?? '-';
  const accountName = employee.accountName ?? '-';

  const columns: TableColumn[] = [
    {
      header: labels.PAYROLL_COLUMNS.GRADE,
      renderCell: (value) => (value === '-' ? value : <Badge variant="secondary">{value}</Badge>),
    },
    {
      header: labels.PAYROLL_COLUMNS.SALARY_TYPE,
      renderCell: (value) => (value === '-' ? value : <Badge variant="secondary">{value}</Badge>),
    },
    {
      header: labels.PAYROLL_COLUMNS.BANK_NAME,
    },
    {
      header: labels.PAYROLL_COLUMNS.ACCOUNT_NUMBER,
    },
    {
      header: labels.PAYROLL_COLUMNS.ACCOUNT_NAME,
    },
  ];

  const hasData =
    employee.gradeId ||
    employee.salaryType ||
    employee.bankName ||
    employee.accountNumber ||
    employee.accountName;
  const data = hasData ? [[gradeLabel, salaryTypeLabel, bankName, accountNumber, accountName]] : [];

  return (
    <div className="rounded-[14px] border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
        <h2 className="text-base font-semibold text-slate-900">
          {labels.PAYROLL_SETTINGS_CARD_TITLE}
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
