'use client';

import { format, parse } from 'date-fns';
import { useCallback, useMemo } from 'react';
import { useOfficesInfinite } from '@/domains/office';
import { useProjectsInfinite } from '@/domains/project-control';
import { useEmployeesInfinite } from '@/domains/users';
import { useWarehousesInfinite } from '@/domains/warehouse';
import { AsyncSelect } from '@/shared/components/atoms';
import { DatePicker } from '@/shared/components/molecules';
import {
  DynamicFilterDrawer,
  type FilterConfig,
} from '@/shared/components/organisms/DynamicFilterDrawer';
import { useAttendanceStatuses } from '@/shared/hooks/use-enums';

interface AttendanceFilterDrawerProps {
  open: boolean;
  onClose: () => void;
  onApply: (vals: Record<string, unknown>) => void;
  initialValues: Record<string, unknown>;
  companyId?: string | null;
}

export function AttendanceFilterDrawer({
  open,
  onClose,
  onApply,
  initialValues,
  companyId,
}: AttendanceFilterDrawerProps) {
  // Hooks only fetch when drawer open
  const { data: statusOptions } = useAttendanceStatuses();

  const {
    options: employeeOptions,
    isLoading: employeesLoading,
    hasMore: employeesHasMore,
    loadMore: employeesLoadMore,
  } = useEmployeesInfinite({ companyId, perPage: 20, enabled: open });

  const {
    options: officeOptions,
    isLoading: officesLoading,
    hasMore: officesHasMore,
    loadMore: officesLoadMore,
  } = useOfficesInfinite({ perPage: 20, enabled: open });

  const {
    options: warehouseOptions,
    isLoading: warehousesLoading,
    hasMore: warehousesHasMore,
    loadMore: warehousesLoadMore,
  } = useWarehousesInfinite({ perPage: 20, enabled: open });

  const {
    options: projectOptions,
    isLoading: projectsLoading,
    hasMore: projectsHasMore,
    loadMore: projectsLoadMore,
  } = useProjectsInfinite({ perPage: 20, companyId, enabled: open });

  // ── Status select options ──
  const statusSelectOptions = useMemo(
    () =>
      (statusOptions ?? []).map((s: any) => ({
        value: s.id || s.value,
        label: s.name || s.label,
      })),
    [statusOptions]
  );

  // ── Filter configs ──
  const filterConfigs: FilterConfig[] = useMemo(
    () => [
      {
        type: 'dateRange',
        label: 'Date range',
        renderEditor: ({ value, onChange }) => {
          const dateRange = value as { startDate?: string; endDate?: string } | undefined;
          const fromVal = dateRange?.startDate
            ? parse(dateRange.startDate, 'yyyy-MM-dd', new Date())
            : undefined;
          const toVal = dateRange?.endDate
            ? parse(dateRange.endDate, 'yyyy-MM-dd', new Date())
            : undefined;
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
          const selected = Array.isArray(value) ? value : [];
          return (
            <AsyncSelect
              options={statusSelectOptions}
              value={selected}
              onChange={(v) => {
                const arr = Array.isArray(v) ? v : v ? [v] : [];
                onChange(arr.length > 0 ? arr : undefined);
              }}
              isMulti
              isSearchable
              placeholder="Pilih status"
              noOptionsMessage="Tidak ada status"
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
      {
        type: 'location',
        label: 'Location',
        renderEditor: ({ value, onChange }) => {
          const locValue = value as
            | { locationType: 'Office' | 'Warehouse'; locationId: string }
            | undefined;
          const locationType = locValue?.locationType ?? 'Office';
          const locationId = locValue?.locationId ?? '';
          const currentOptions = locationType === 'Warehouse' ? warehouseOptions : officeOptions;
          const currentLoading = locationType === 'Warehouse' ? warehousesLoading : officesLoading;
          const currentHasMore = locationType === 'Warehouse' ? warehousesHasMore : officesHasMore;
          const currentLoadMore =
            locationType === 'Warehouse' ? warehousesLoadMore : officesLoadMore;

          return (
            <div className="space-y-2">
              <div className="flex gap-2">
                <button
                  type="button"
                  className={`flex-1 px-3 py-1.5 text-sm rounded-md border transition-colors ${
                    locationType === 'Office'
                      ? 'bg-teal-50 border-teal-300 text-teal-700'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                  onClick={() => onChange({ locationType: 'Office', locationId: '' })}
                >
                  Office
                </button>
                <button
                  type="button"
                  className={`flex-1 px-3 py-1.5 text-sm rounded-md border transition-colors ${
                    locationType === 'Warehouse'
                      ? 'bg-teal-50 border-teal-300 text-teal-700'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                  onClick={() => onChange({ locationType: 'Warehouse', locationId: '' })}
                >
                  Warehouse
                </button>
              </div>
              <AsyncSelect
                options={currentOptions}
                value={locationId ? locationId : null}
                onChange={(v) => {
                  const id = Array.isArray(v) ? v[0] : v;
                  onChange(
                    id
                      ? {
                          locationType,
                          locationId: id as string,
                        }
                      : undefined
                  );
                }}
                isSearchable
                isLoading={currentLoading}
                onScrollToBottom={currentHasMore ? currentLoadMore : undefined}
                placeholder={locationType === 'Warehouse' ? 'Pilih Warehouse' : 'Pilih Office'}
                noOptionsMessage="Tidak ada data"
              />
            </div>
          );
        },
      },
    ],
    [
      statusSelectOptions,
      employeeOptions,
      employeesLoading,
      employeesHasMore,
      employeesLoadMore,
      projectOptions,
      projectsLoading,
      projectsHasMore,
      projectsLoadMore,
      officeOptions,
      officesLoading,
      officesHasMore,
      officesLoadMore,
      warehouseOptions,
      warehousesLoading,
      warehousesHasMore,
      warehousesLoadMore,
    ]
  );

  const handleApply = useCallback(
    (vals: Record<string, unknown>) => {
      onApply(vals);
    },
    [onApply]
  );

  return (
    <DynamicFilterDrawer
      open={open}
      onClose={onClose}
      onApply={handleApply}
      availableFilters={filterConfigs}
      initialValues={initialValues}
    />
  );
}
