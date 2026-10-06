import Link from 'next/link';
import type { StockMovementSourceRef } from '../types';

function normalizeSourceType(type: string) {
  return type
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-');
}

/**
 * Only Delivery Order and Allocation have a real detail destination in this
 * app today — Goods Receipt and Stock Adjustment have no detail page
 * anywhere yet. Unmapped/unknown source types render as plain text instead
 * of a dead link.
 */
function getSourceHref(source: StockMovementSourceRef): string | undefined {
  const type = normalizeSourceType(source.type);

  if (type === 'do' || type === 'delivery-order') {
    return `/logistic/delivery-order/${source.id}`;
  }

  if (type === 'allocation' || type === 'resource-allocation') {
    return `/resource-management/allocation?allocationId=${source.id}`;
  }

  return undefined;
}

interface SourceLinkProps {
  source: StockMovementSourceRef | undefined | null;
}

export function SourceLink({ source }: SourceLinkProps) {
  if (!source) return <>-</>;

  const href = getSourceHref(source);
  if (!href) return <>{source.code}</>;

  return (
    <Link href={href} className="text-primary hover:underline">
      {source.code}
    </Link>
  );
}
