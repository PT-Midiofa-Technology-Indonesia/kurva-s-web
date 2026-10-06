import { Badge } from '@/shared/components/ui';
import { getBillingStatusMeta } from '../services';
import type { BillingStatus } from '../types';

export function StatusBadge({ status }: { status: BillingStatus }) {
  const meta = getBillingStatusMeta(status);

  return <Badge variant={meta.badgeVariant}>{meta.label}</Badge>;
}
