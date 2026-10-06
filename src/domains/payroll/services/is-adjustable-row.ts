import type { EmployeeSalaryAdjustmentGridRow } from '../types';

function isMeaningful(value: string | number | null | undefined): boolean {
  if (value === null || value === undefined || value === '') return false;
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) && parsed !== 0;
}

/**
 * Whether the salary structure actually set something for this component.
 *
 * The API reports an unset component as `0` with no bounds rather than `null`,
 * so a bare null check misses it and the row renders as if it were ready to edit.
 * A zero default paired with a real range is a different thing — a component that
 * starts at nothing but may be raised — and stays adjustable.
 */
export function isAdjustableRow(row: EmployeeSalaryAdjustmentGridRow): boolean {
  return (
    isMeaningful(row.defaultAmount) || isMeaningful(row.minAmount) || isMeaningful(row.maxAmount)
  );
}
