import { BILLING_STATUS_LABELS } from '../constants';
import type { BillingStatus } from '../types';

type BillingBadgeVariant =
  | 'default'
  | 'secondary'
  | 'success'
  | 'destructive'
  | 'outline'
  | 'warning';
type BillingCalendarColor = 'slate' | 'blue' | 'orange' | 'green' | 'red';

const BILLING_STATUS_META: Record<
  BillingStatus,
  {
    label: string;
    badgeVariant: BillingBadgeVariant;
    calendarColor: BillingCalendarColor;
  }
> = {
  draft: {
    label: BILLING_STATUS_LABELS.draft,
    badgeVariant: 'outline',
    calendarColor: 'slate',
  },
  invoiced: {
    label: BILLING_STATUS_LABELS.invoiced,
    badgeVariant: 'warning',
    calendarColor: 'orange',
  },
  pendingClearance: {
    label: BILLING_STATUS_LABELS.pendingClearance,
    badgeVariant: 'secondary',
    calendarColor: 'orange',
  },
  paid: {
    label: BILLING_STATUS_LABELS.paid,
    badgeVariant: 'success',
    calendarColor: 'green',
  },
  cancelled: {
    label: BILLING_STATUS_LABELS.cancelled,
    badgeVariant: 'destructive',
    calendarColor: 'red',
  },
};

const FALLBACK_BILLING_STATUS_META = {
  label: 'Status Tidak Dikenal',
  badgeVariant: 'secondary',
  calendarColor: 'slate',
} as const;

export function getBillingStatusMeta(status: BillingStatus | string) {
  return BILLING_STATUS_META[status as BillingStatus] ?? FALLBACK_BILLING_STATUS_META;
}

export type { BillingBadgeVariant, BillingCalendarColor };
