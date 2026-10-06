'use client';

import { AsyncSelect } from '@/shared/components/atoms';
import {
  DynamicFilterDrawer,
  type FilterConfig,
} from '@/shared/components/organisms/DynamicFilterDrawer';
import { LEAVE_LABELS } from '../constants';

interface LeaveFilterDrawerProps {
  open: boolean;
  onClose: () => void;
  onApply: (vals: Record<string, unknown>) => void;
  initialValues: Record<string, unknown>;
  employeeOptions: Array<{ value: string; label: string }>;
  yearOptions: Array<{ value: string; label: string }>;
  leaveTypeOptions: Array<{ value: string; label: string }>;
  statusOptions: Array<{ value: string; label: string }>;
}

export function LeaveFilterDrawer({
  open,
  onClose,
  onApply,
  initialValues,
  employeeOptions,
  yearOptions,
  leaveTypeOptions,
  statusOptions,
}: LeaveFilterDrawerProps) {
  const filterConfigs: FilterConfig[] = [
    {
      type: 'employee',
      label: LEAVE_LABELS.LIST.FILTERS.EMPLOYEE,
      renderEditor: ({ value, onChange }) => (
        <AsyncSelect
          options={employeeOptions}
          value={value as string | null | undefined}
          onChange={(selected) => {
            onChange(Array.isArray(selected) ? selected[0] : selected || undefined);
          }}
          isSearchable
          placeholder="Pilih karyawan"
        />
      ),
    },
    {
      type: 'year',
      label: LEAVE_LABELS.LIST.FILTERS.YEAR,
      renderEditor: ({ value, onChange }) => (
        <AsyncSelect
          options={yearOptions}
          value={value as string | null | undefined}
          onChange={(selected) => {
            onChange(Array.isArray(selected) ? selected[0] : selected || undefined);
          }}
          isSearchable
          placeholder="Pilih tahun"
        />
      ),
    },
    {
      type: 'status',
      label: LEAVE_LABELS.LIST.FILTERS.STATUS,
      renderEditor: ({ value, onChange }) => (
        <AsyncSelect
          options={statusOptions}
          value={value as string | null | undefined}
          onChange={(selected) => {
            onChange(Array.isArray(selected) ? selected[0] : selected || undefined);
          }}
          isSearchable
          placeholder="Pilih status"
        />
      ),
    },
    {
      type: 'leaveType',
      label: LEAVE_LABELS.LIST.FILTERS.LEAVE_TYPE,
      renderEditor: ({ value, onChange }) => (
        <AsyncSelect
          options={leaveTypeOptions}
          value={value as string | null | undefined}
          onChange={(selected) => {
            onChange(Array.isArray(selected) ? selected[0] : selected || undefined);
          }}
          isSearchable
          placeholder="Pilih jenis cuti"
        />
      ),
    },
  ];

  return (
    <DynamicFilterDrawer
      open={open}
      onClose={onClose}
      onApply={onApply}
      availableFilters={filterConfigs}
      initialValues={initialValues}
    />
  );
}
