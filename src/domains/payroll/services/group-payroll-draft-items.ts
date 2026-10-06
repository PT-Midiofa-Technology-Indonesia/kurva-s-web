import type { PayrollDraftItem } from '../types';

export interface PayrollDraftEmployeeGroup {
  employeeId: string;
  employeeName: string;
  items: PayrollDraftItem[];
  subtotal: number;
}

export function parsePayrollMoney(value: string | number | null | undefined): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function getPayrollSignedAmount(item: PayrollDraftItem): number {
  const hasSignedAmount =
    typeof item.signedAmount === 'number' ||
    (typeof item.signedAmount === 'string' && item.signedAmount.trim() !== '');
  const parsedSignedAmount = hasSignedAmount ? Number(item.signedAmount) : Number.NaN;

  return Number.isFinite(parsedSignedAmount)
    ? parsedSignedAmount
    : parsePayrollMoney(item.amount) * (item.isDeduction ? -1 : 1);
}

export function groupPayrollDraftItems(items: PayrollDraftItem[]): PayrollDraftEmployeeGroup[] {
  const groups = new Map<string, PayrollDraftEmployeeGroup>();

  for (const item of items) {
    const signedAmount = getPayrollSignedAmount(item);
    const group = groups.get(item.employeeId) ?? {
      employeeId: item.employeeId,
      employeeName: item.employeeName,
      items: [],
      subtotal: 0,
    };

    group.items.push(item);
    group.subtotal += signedAmount;
    groups.set(item.employeeId, group);
  }

  return [...groups.values()];
}
