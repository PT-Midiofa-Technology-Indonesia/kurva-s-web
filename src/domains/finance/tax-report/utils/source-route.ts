import type { TaxReportStatus } from '../types';

export type TaxReportStatusVariant = 'default' | 'success' | 'warning' | 'destructive';

export function getTaxReportSourceHref(resourceType: string, resourceId: string): string | null {
  if (resourceType === 'purchase_order') return `/procurement/purchase-order/${resourceId}`;
  if (resourceType === 'cost_request') return `/expense-management/cost-request/${resourceId}`;
  return null;
}

export function getTaxReportStatusVariant(
  status: TaxReportStatus | string
): TaxReportStatusVariant {
  if (status === 'pending' || status === 'in_progress') return 'warning';
  if (status === 'included' || status === 'closed') return 'success';
  if (status === 'reported' || status === 'not_reported') return 'destructive';
  return 'default';
}
