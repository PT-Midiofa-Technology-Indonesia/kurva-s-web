'use client';

import { format } from 'date-fns';
import { useMemo } from 'react';
import { useProjectsInfinite } from '@/domains/project-control';
import { useEmployeesInfinite } from '@/domains/users';
import { AsyncSelect } from '@/shared/components/atoms';
import { DatePicker } from '@/shared/components/molecules';
import {
  DynamicFilterDrawer,
  type FilterConfig,
} from '@/shared/components/organisms/DynamicFilterDrawer';

interface OvertimeFilterDrawerProps {
  open: boolean;
  onClose: () => void;
  onApply: (vals: Record<string, unknown>) => void;
  initialValues: Record<string, unknown>;
  companyId?: string | null;
}

export function OvertimeFilterDrawer({
  open,
  onClose,
  onApply,
  initialValues,
  companyId,
}: OvertimeFilterDrawerProps) {
  const {
    options: employeeOptions,
    isLoading: employeesLoading,
    hasMore: employeesHasMore,
    loadMore: employeesLoadMore,
  } = useEmployeesInfinite({ companyId, perPage: 20, enabled: open });

  const {
    options: projectOptions,
    isLoading: projectsLoading,
    hasMore: projectsHasMore,
    loadMore: projectsLoadMore,
  } = useProjectsInfinite({ perPage: 20, companyId, enabled: open });

  const filterConfigs: FilterConfig[] = useMemo(
    () => [
      {
        type: 'dateRange',
        label: 'Date range',
        renderEditor: ({ value, onChange }) => {
          const dateRange = value as { startDate?: string; endDate?: string } | undefined;
          const fromVal = dateRange?.startDate
            ? new Date(`${dateRange.startDate}T00:00:00`)
            : undefined;
          const toVal = dateRange?.endDate ? new Date(`${dateRange.endDate}T00:00:00`) : undefined;
          return (
            <DatePicker
              mode="range"
              value={fromVal || toVal ? { from: fromVal!, to: toVal } : undefined}
              onChange={(v) => {
                if (!v || !('from' in v) || !(v as any).from) {
                  onChange(undefined);
                  return;
                }
                const range = v as { from?: Date; to?: Date };
                onChange({
                  startDate: range.from ? format(range.from, 'yyyy-MM-dd') : '',
                  endDate: range.to ? format(range.to, 'yyyy-MM-dd') : '',
                });
              }}
              rangePlaceholder="Pilih rentang tanggal"
            />
          );
        },
      },
      {
        type: 'status',
        label: 'Status',
        renderEditor: ({ value, onChange }) => {
          const statusOptions = [
            { value: 'done', label: 'Done' },
            { value: 'cancelled', label: 'Cancelled' },
          ];
          return (
            <AsyncSelect
              options={statusOptions}
              value={value as string | null | undefined}
              onChange={(v) => {
                onChange(Array.isArray(v) ? v[0] : v || undefined);
              }}
              isSearchable
              placeholder="Pilih status"
            />
          );
        },
      },
      {
        type: 'employee',
        label: 'Employee',
        renderEditor: ({ value, onChange }) => {
          const selected = Array.isArray(value) ? value : [];
          return (
            <AsyncSelect
              options={employeeOptions}
              value={selected}
              onChange={(v) => {
                const arr = Array.isArray(v) ? v : v ? [v] : [];
                onChange(arr.length > 0 ? arr : undefined);
              }}
              isMulti
              isSearchable
              isLoading={employeesLoading}
              onScrollToBottom={employeesHasMore ? employeesLoadMore : undefined}
              placeholder="Cari employee"
              noOptionsMessage="Tidak ada data"
            />
          );
        },
      },
      {
        type: 'project',
        label: 'Project',
        renderEditor: ({ value, onChange }) => {
          const selected = Array.isArray(value) ? value : [];
          return (
            <AsyncSelect
              options={projectOptions}
              value={selected}
              onChange={(v) => {
                const arr = Array.isArray(v) ? v : v ? [v] : [];
                onChange(arr.length > 0 ? arr : undefined);
              }}
              isMulti
              isSearchable
              isLoading={projectsLoading}
              onScrollToBottom={projectsHasMore ? projectsLoadMore : undefined}
              placeholder="Cari project"
              noOptionsMessage="Tidak ada data"
            />
          );
        },
      },
    ],
    [
      employeeOptions,
      employeesLoading,
      employeesHasMore,
      employeesLoadMore,
      projectOptions,
      projectsLoading,
      projectsHasMore,
      projectsLoadMore,
    ]
  );

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
