import { describe, expect, it } from 'vitest';
import type { EmployeeSalaryAdjustmentGridRow } from '../types';
import { isAdjustableRow } from './is-adjustable-row';

function row(overrides: Partial<EmployeeSalaryAdjustmentGridRow>): EmployeeSalaryAdjustmentGridRow {
  return {
    payrollComponentId: 'c1',
    componentName: 'Tunjangan Makan',
    category: 'tunjangan',
    categoryLabel: 'Tunjangan',
    isDeduction: false,
    valueType: 'fixed',
    baseScope: null,
    baseComponentName: null,
    defaultAmount: null,
    minAmount: null,
    maxAmount: null,
    adjustedAmount: null,
    reason: null,
    ...overrides,
  };
}

describe('isAdjustableRow', () => {
  it('accepts a row the structure fully configured', () => {
    expect(
      isAdjustableRow(row({ defaultAmount: 5000000, minAmount: 2000000, maxAmount: 10000000 }))
    ).toBe(true);
  });

  it('rejects a row the structure never filled in', () => {
    expect(isAdjustableRow(row({ defaultAmount: null }))).toBe(false);
  });

  it('rejects the zero-with-no-range shape the API sends for an unset component', () => {
    expect(isAdjustableRow(row({ defaultAmount: 0, minAmount: null, maxAmount: null }))).toBe(
      false
    );
  });

  it('accepts a zero default that carries a real range', () => {
    expect(isAdjustableRow(row({ defaultAmount: 0, minAmount: 0, maxAmount: 500000 }))).toBe(true);
  });

  it('accepts a row with only a lower bound set', () => {
    expect(isAdjustableRow(row({ defaultAmount: null, minAmount: 100000 }))).toBe(true);
  });

  it('reads the string amounts the API sends', () => {
    expect(isAdjustableRow(row({ defaultAmount: '5000000' }))).toBe(true);
    expect(isAdjustableRow(row({ defaultAmount: '0' }))).toBe(false);
  });

  it('accepts a percentage row configured with a rate', () => {
    expect(isAdjustableRow(row({ valueType: 'percentage', defaultAmount: 5 }))).toBe(true);
  });

  it('rejects a percentage row left at zero with no bounds', () => {
    expect(isAdjustableRow(row({ valueType: 'percentage', defaultAmount: 0 }))).toBe(false);
  });
});
