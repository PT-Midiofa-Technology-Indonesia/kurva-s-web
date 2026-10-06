import { formatCurrencyIDR } from '@/shared/utils/format';
import type { PayrollBaseScope, PayrollValueType } from '../types';

const PERCENTAGE_MIN = 0;
const PERCENTAGE_MAX = 100;

const MESSAGES = {
  PERCENTAGE_RANGE: `Persentase harus antara ${PERCENTAGE_MIN} dan ${PERCENTAGE_MAX}`,
  NEGATIVE_AMOUNT: 'Nominal tidak boleh negatif',
} as const;

function toNumber(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined || value === '') return null;
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function formatPayrollValue(
  value: string | number | null | undefined,
  valueType: PayrollValueType
): string {
  const parsed = toNumber(value);
  if (parsed === null) return '-';

  if (valueType === 'percentage') {
    return `${new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 }).format(parsed)}%`;
  }

  return formatCurrencyIDR(parsed);
}

export function getPayrollValueBasis(
  valueType: PayrollValueType,
  baseScope: PayrollBaseScope,
  baseComponentName: string | null
): string | null {
  if (valueType !== 'percentage') return null;
  if (baseScope === 'gross') return 'dari Total Bruto';
  if (baseScope === 'component' && baseComponentName) return `dari ${baseComponentName}`;
  return null;
}

export function validatePayrollValue(
  value: string | number | null | undefined,
  valueType: PayrollValueType
): string | null {
  const parsed = toNumber(value);
  if (parsed === null) return null;

  if (valueType === 'percentage') {
    return parsed < PERCENTAGE_MIN || parsed > PERCENTAGE_MAX ? MESSAGES.PERCENTAGE_RANGE : null;
  }

  return parsed < 0 ? MESSAGES.NEGATIVE_AMOUNT : null;
}
