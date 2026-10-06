'use client';

import { Badge } from '@/shared/components/ui';
import type { BadgeVariant } from '../constants';

/** "Low Stock" / "low_stock" / "LOW STOCK" all normalise to "low-stock". */
function normaliseStatus(status: string): string {
  return status
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

interface StockStatusBadgeProps {
  status: string;
  variants: Record<string, BadgeVariant>;
}

/**
 * Renders a backend-supplied status string. An unrecognised value still shows
 * its label (neutral styling) rather than disappearing, so a new backend status
 * degrades visibly instead of silently.
 */
export function StockStatusBadge({ status, variants }: StockStatusBadgeProps) {
  if (!status) return <span className="text-muted-foreground">-</span>;

  const variant = variants[normaliseStatus(status)] ?? 'secondary';
  return <Badge variant={variant}>{status}</Badge>;
}
