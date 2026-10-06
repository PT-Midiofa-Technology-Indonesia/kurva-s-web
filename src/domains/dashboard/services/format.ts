import { formatCurrencyIDR } from '@/shared/utils/format';
import { DASHBOARD_LABELS } from '../constants';

export function formatCompactCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '--';
  }

  const absoluteValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  if (absoluteValue >= 1_000_000_000) {
    const formatted = new Intl.NumberFormat('id-ID', {
      maximumFractionDigits: 1,
    }).format(absoluteValue / 1_000_000_000);
    return `${sign}Rp ${formatted} M`;
  }

  if (absoluteValue >= 1_000_000) {
    const formatted = new Intl.NumberFormat('id-ID', {
      maximumFractionDigits: 1,
    }).format(absoluteValue / 1_000_000);
    return `${sign}Rp ${formatted} jt`;
  }

  return formatCurrencyIDR(value);
}

const PERCENT_MAX_FRACTION_DIGITS = 2;

function formatPercentDigits(value: number): string {
  return value.toLocaleString('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: PERCENT_MAX_FRACTION_DIGITS,
  });
}

export function formatPercent(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '--';
  }

  return `${formatPercentDigits(value)}%`;
}

export function formatSCurvePercent(value: number | null): string {
  if (value === null) {
    return DASHBOARD_LABELS.SCURVE.TABLE_EMPTY_VALUE;
  }

  return `${value.toLocaleString('id-ID')}%`;
}

export function formatSignedPercentage(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '--';
  }

  const absolute = formatPercentDigits(Math.abs(value));

  return `${value > 0 ? '+' : value < 0 ? '-' : ''}${absolute} %`;
}
