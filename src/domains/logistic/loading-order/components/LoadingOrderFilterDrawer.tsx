'use client';

import type { DateRange } from 'react-day-picker';
import { AsyncSelect, type SelectOption } from '@/shared/components/atoms';
import { DatePicker } from '@/shared/components/molecules/DatePicker/DatePicker';
import {
  DynamicFilterDrawer,
  type FilterConfig,
} from '@/shared/components/organisms/DynamicFilterDrawer';
import { LOADING_ORDER_LABELS, LOADING_ORDER_SOURCE_TYPE_OPTIONS } from '../constants';

interface LoadingOrderFilterDrawerProps {
  open: boolean;
  onClose: () => void;
  onApply: (values: Record<string, unknown>) => void;
  initialValues: Record<string, unknown>;
  warehouseOptions: SelectOption[];
}

export function LoadingOrderFilterDrawer({
  open,
  onClose,
  onApply,
  initialValues,
  warehouseOptions,
}: LoadingOrderFilterDrawerProps) {
  const filterConfigs: FilterConfig[] = [
    {
      type: 'sourceType',
      label: LOADING_ORDER_LABELS.LIST.FILTERS.SOURCE_TYPE,
      renderEditor: ({ value, onChange }) => (
        <AsyncSelect
          options={LOADING_ORDER_SOURCE_TYPE_OPTIONS}
          value={value as string | null | undefined}
          onChange={(selected) =>
            onChange(Array.isArray(selected) ? selected[0] : selected || undefined)
          }
          isSearchable={false}
          placeholder="Pilih source type"
          isClearable
        />
      ),
    },
    {
      type: 'warehouseId',
      label: LOADING_ORDER_LABELS.LIST.FILTERS.WAREHOUSE,
      renderEditor: ({ value, onChange }) => (
        <AsyncSelect
          options={warehouseOptions}
          value={value as string | null | undefined}
          onChange={(selected) =>
            onChange(Array.isArray(selected) ? selected[0] : selected || undefined)
          }
          isSearchable
          placeholder="Pilih warehouse"
          isClearable
        />
      ),
    },
    {
      type: 'dateRange',
      label: LOADING_ORDER_LABELS.LIST.FILTERS.DATE_RANGE,
      renderEditor: ({ value, onChange }) => (
        <DatePicker
          mode="range"
          value={value as DateRange | null | undefined}
          onChange={(selected) => onChange(selected || undefined)}
          rangePlaceholder="Pilih rentang tanggal"
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
