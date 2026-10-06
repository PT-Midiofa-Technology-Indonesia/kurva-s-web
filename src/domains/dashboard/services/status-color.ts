import type { SummaryTone } from '../types';

type StatusBadgeVariant =
  | 'default'
  | 'secondary'
  | 'destructive'
  | 'outline'
  | 'success'
  | 'warning';

export interface StatusColorMeta {
  badgeVariant: StatusBadgeVariant;
  tone: SummaryTone;
  dotClass: string;
  chartColor: string;
}

const STATUS_COLOR_META: Record<string, StatusColorMeta> = {
  success: {
    badgeVariant: 'success',
    tone: 'green',
    dotClass: 'bg-green-500',
    chartColor: 'var(--color-green-600)',
  },
  warning: {
    badgeVariant: 'warning',
    tone: 'amber',
    dotClass: 'bg-amber-500',
    chartColor: 'var(--color-amber-500)',
  },
  danger: {
    badgeVariant: 'destructive',
    tone: 'red',
    dotClass: 'bg-destructive',
    chartColor: 'var(--color-destructive-600)',
  },
  muted: {
    badgeVariant: 'outline',
    tone: 'slate',
    dotClass: 'bg-slate-400',
    chartColor: 'var(--color-slate-300)',
  },
};

export function getStatusColorMeta(statusColor: string): StatusColorMeta {
  return STATUS_COLOR_META[statusColor] ?? STATUS_COLOR_META.muted;
}
