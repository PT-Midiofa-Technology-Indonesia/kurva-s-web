'use client';

import { Checkbox } from '@/shared/components/atoms';
import {
  DynamicFilterDrawer,
  type FilterConfig,
} from '@/shared/components/organisms/DynamicFilterDrawer';
import { ADJUSTMENT_LABELS, HAS_ADJUSTMENT_OPTIONS } from '../constants';

interface FilterOption {
  value: string;
  label: string;
}

interface CheckboxListEditorProps {
  label: string;
  options: FilterOption[];
  value: unknown;
  onChange: (value: unknown) => void;
}

function CheckboxListEditor({ label, options, value, onChange }: CheckboxListEditorProps) {
  const selected = Array.isArray(value) ? (value as string[]) : [];
  const allSelected = options.length > 0 && selected.length === options.length;

  const handleToggleAll = (checked: boolean) => {
    onChange(checked ? options.map((o) => o.value) : []);
  };

  const handleToggleOne = (optionValue: string, checked: boolean) => {
    onChange(checked ? [...selected, optionValue] : selected.filter((v) => v !== optionValue));
  };

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-slate-500">
        {selected.length} selected {label}
      </p>
      <div className="max-h-48 overflow-y-auto flex flex-col gap-2.5 rounded-md border border-slate-100 p-2.5">
        <Checkbox
          size="sm"
          label={`Select all ${label}`}
          checked={allSelected}
          onCheckedChange={(checked) => handleToggleAll(checked === true)}
        />
        <div className="border-t border-slate-100 pt-2.5 flex flex-col gap-2.5">
          {options.map((option) => (
            <Checkbox
              key={option.value}
              size="sm"
              label={option.label}
              checked={selected.includes(option.value)}
              onCheckedChange={(checked) => handleToggleOne(option.value, checked === true)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface EmployeeSalaryAdjustmentFilterDrawerProps {
  open: boolean;
  onClose: () => void;
  onApply: (values: Record<string, unknown>) => void;
  initialValues: Record<string, unknown>;
  golonganOptions: FilterOption[];
}

export function EmployeeSalaryAdjustmentFilterDrawer({
  open,
  onClose,
  onApply,
  initialValues,
  golonganOptions,
}: EmployeeSalaryAdjustmentFilterDrawerProps) {
  const filterConfigs: FilterConfig[] = [
    {
      type: 'golongan',
      label: ADJUSTMENT_LABELS.FILTER.GOLONGAN,
      renderEditor: ({ value, onChange }) => (
        <CheckboxListEditor
          label={ADJUSTMENT_LABELS.FILTER.GOLONGAN}
          options={golonganOptions}
          value={value}
          onChange={onChange}
        />
      ),
    },
    {
      type: 'hasAdjustment',
      label: ADJUSTMENT_LABELS.FILTER.HAS_ADJUSTMENT,
      renderEditor: ({ value, onChange }) => (
        <CheckboxListEditor
          label={ADJUSTMENT_LABELS.FILTER.HAS_ADJUSTMENT}
          options={HAS_ADJUSTMENT_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
          value={value}
          onChange={onChange}
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
