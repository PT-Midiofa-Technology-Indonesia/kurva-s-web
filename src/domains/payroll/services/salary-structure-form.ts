import type { PayrollBaseScope, PayrollValueType, SalaryType } from '../types';
import { validatePayrollValue } from './format-payroll-value';

export type StructureFormItem = {
  payroll_component_id: string;
  component_name: string;
  category: string;
  is_deduction: boolean;
  value_type: PayrollValueType;
  base_scope: PayrollBaseScope;
  base_component_name: string | null;
  is_applicable: boolean;
  is_mandatory: boolean;
  default_amount: number | null;
  min_amount: number | null;
  max_amount: number | null;
  is_active: boolean;
};

export type StructureFieldErrors = {
  default_amount?: string;
  min_amount?: string;
  max_amount?: string;
  is_applicable?: string;
};

/** category -> rows, the shape one salary type's tab holds */
export type StructureFormData = Record<string, StructureFormItem[]>;

export type StructureErrors = Record<string, StructureFieldErrors>;

export function validateStructureItem(item: StructureFormItem): StructureFieldErrors {
  const errors: StructureFieldErrors = {};
  if (!item.is_applicable) return errors;

  const defaultError = validatePayrollValue(item.default_amount, item.value_type);
  if (defaultError) errors.default_amount = defaultError;

  const minError = validatePayrollValue(item.min_amount, item.value_type);
  if (minError) {
    errors.min_amount = minError;
  } else if (
    item.min_amount !== null &&
    item.default_amount !== null &&
    item.min_amount > item.default_amount
  ) {
    errors.min_amount = 'Min tidak boleh lebih besar dari Default';
  }

  const maxError = validatePayrollValue(item.max_amount, item.value_type);
  if (maxError) {
    errors.max_amount = maxError;
  } else if (
    item.max_amount !== null &&
    item.default_amount !== null &&
    item.max_amount < item.default_amount
  ) {
    errors.max_amount = 'Max tidak boleh lebih kecil dari Default';
  }

  return errors;
}

/** Errors of one salary type's tab, keyed by component id. */
export function collectStructureErrors(data: StructureFormData): StructureErrors {
  const map: StructureErrors = {};

  for (const items of Object.values(data)) {
    for (const item of items) {
      const errors = validateStructureItem(item);
      if (Object.keys(errors).length > 0) {
        map[item.payroll_component_id] = errors;
      }
    }
  }

  return map;
}

/**
 * The first salary type carrying an error, in tab order — the tab to jump to so
 * the message is on screen rather than hidden behind another tab.
 */
export function findFirstTypeWithErrors(
  errorsByType: Partial<Record<SalaryType, StructureErrors>>,
  order: readonly SalaryType[]
): SalaryType | null {
  for (const type of order) {
    const errors = errorsByType[type];
    if (errors && Object.keys(errors).length > 0) return type;
  }
  return null;
}
