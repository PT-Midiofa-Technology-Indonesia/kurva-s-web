'use client';

import type { DateRange } from 'react-day-picker';
import { AsyncSelect, type SelectOption } from '@/shared/components/atoms';
import { DatePicker } from '@/shared/components/molecules/DatePicker/DatePicker';
import {
  DynamicFilterDrawer,
  type FilterConfig,
} from '@/shared/components/organisms/DynamicFilterDrawer';
import { usePickupOrderTypes } from '@/shared/hooks/use-enums';
import { PICKUP_ORDER_LABELS } from '../constants';

interface PickupOrderFilterDrawerProps {
  open: boolean;
  onClose: () => void;
  onApply: (values: Record<string, unknown>) => void;
  initialValues: Record<string, unknown>;
  warehouseOptions: SelectOption[];
}

export function PickupOrderFilterDrawer({
  open,
  onClose,
  onApply,
  initialValues,
  warehouseOptions,
}: PickupOrderFilterDrawerProps) {
  const { data: typeOptions = [] } = usePickupOrderTypes();

  const filterConfigs: FilterConfig[] = [
    {
      type: 'type',
      label: PICKUP_ORDER_LABELS.LIST.FILTERS.TYPE,
      renderEditor: ({ value, onChange }) => (
        <AsyncSelect
          options={typeOptions}
          value={value as string | null | undefined}
          onChange={(selected) =>
            onChange(Array.isArray(selected) ? selected[0] : selected || undefined)
          }
          isSearchable={false}
          placeholder="Pilih type"
          isClearable
        />
      ),
    },
    {
      type: 'warehouseId',
      label: PICKUP_ORDER_LABELS.LIST.FILTERS.WAREHOUSE,
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
      label: PICKUP_ORDER_LABELS.LIST.FILTERS.DATE_RANGE,
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
