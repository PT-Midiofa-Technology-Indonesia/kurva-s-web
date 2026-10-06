import { describe, expect, it } from 'vitest';
import type { SalaryType } from '../types';
import {
  collectStructureErrors,
  findFirstTypeWithErrors,
  type StructureFormItem,
  validateStructureItem,
} from './salary-structure-form';

const TAB_ORDER: readonly SalaryType[] = ['monthly', 'daily', 'hourly'];

function item(overrides: Partial<StructureFormItem> = {}): StructureFormItem {
  return {
    payroll_component_id: 'c1',
    component_name: 'Gaji Pokok',
    category: 'pokok',
    is_deduction: false,
    value_type: 'fixed',
    base_scope: null,
    base_component_name: null,
    is_applicable: true,
    is_mandatory: false,
    default_amount: 5000000,
    min_amount: null,
    max_amount: null,
    is_active: true,
    ...overrides,
  };
}

describe('validateStructureItem', () => {
  it('accepts a well-formed row', () => {
    expect(validateStructureItem(item({ min_amount: 1000000, max_amount: 9000000 }))).toEqual({});
  });

  it('rejects a min above the default', () => {
    expect(validateStructureItem(item({ min_amount: 6000000 })).min_amount).toBe(
      'Min tidak boleh lebih besar dari Default'
    );
  });

  it('rejects a max below the default', () => {
    expect(validateStructureItem(item({ max_amount: 1000000 })).max_amount).toBe(
      'Max tidak boleh lebih kecil dari Default'
    );
  });

  it('rejects a percentage above 100', () => {
    expect(
      validateStructureItem(item({ value_type: 'percentage', default_amount: 150 })).default_amount
    ).toBe('Persentase harus antara 0 dan 100');
  });

  it('skips a row the grade does not get', () => {
    expect(
      validateStructureItem(item({ is_applicable: false, default_amount: -5, min_amount: 999 }))
    ).toEqual({});
  });
});

describe('collectStructureErrors', () => {
  it('keys the errors by component id across categories', () => {
    const errors = collectStructureErrors({
      pokok: [item({ payroll_component_id: 'basic', min_amount: 9000000 })],
      tunjangan: [item({ payroll_component_id: 'meal', default_amount: 500000 })],
    });

    expect(Object.keys(errors)).toEqual(['basic']);
    expect(errors.basic.min_amount).toBeTruthy();
  });

  it('returns nothing when every row is fine', () => {
    expect(collectStructureErrors({ pokok: [item()] })).toEqual({});
  });

  it('returns nothing for an empty tab', () => {
    expect(collectStructureErrors({})).toEqual({});
  });
});

describe('findFirstTypeWithErrors', () => {
  it('reports the offending tab so the drawer can jump to it', () => {
    expect(findFirstTypeWithErrors({ daily: { basic: { min_amount: 'x' } } }, TAB_ORDER)).toBe(
      'daily'
    );
  });

  it('follows tab order rather than object order when several tabs fail', () => {
    expect(
      findFirstTypeWithErrors(
        { hourly: { basic: { min_amount: 'x' } }, monthly: { basic: { max_amount: 'y' } } },
        TAB_ORDER
      )
    ).toBe('monthly');
  });

  it('ignores a tab whose error map is empty', () => {
    expect(
      findFirstTypeWithErrors({ monthly: {}, daily: { basic: { max_amount: 'y' } } }, TAB_ORDER)
    ).toBe('daily');
  });

  it('returns null when nothing is wrong', () => {
    expect(findFirstTypeWithErrors({ monthly: {} }, TAB_ORDER)).toBeNull();
  });
});
