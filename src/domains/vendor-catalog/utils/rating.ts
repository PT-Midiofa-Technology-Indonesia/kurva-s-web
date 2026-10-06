import { formatDateTimeLong } from '@/shared/utils/format';
import type { VendorRatingScore, VendorRatingSource, VendorRatingSummaryCategory } from '../types';

const SOURCE_TYPE_LABELS: Record<string, string> = {
  purchase_order: 'PO',
};

export function formatVendorRatingValue(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '- / 5';
  }
  return `${Math.round(value)} / 5`;
}

export function formatVendorRatingDateTime(value: string | null | undefined): string {
  if (!value) return '-';
  const normalized = value.includes('T') ? value : value.replace(' ', 'T');
  return formatDateTimeLong(normalized);
}

export function formatVendorRatingSummaryCategoryLabel(
  category: Pick<VendorRatingSummaryCategory, 'categoryId' | 'categoryName' | 'isActive'>
): string {
  if (category.isActive) return category.categoryName;
  return `${category.categoryName} ${category.categoryId ? '(inactive)' : '(deleted)'}`;
}

export function formatVendorRatingScoreLabel(
  score: Pick<VendorRatingScore, 'categoryName' | 'categoryStatus'>
): string {
  if (score.categoryStatus === 'active') return score.categoryName;
  return `${score.categoryName} (${score.categoryStatus})`;
}

export function formatVendorRatingSourceLabel(source: VendorRatingSource): string {
  if (source.label) return source.label;
  const sourceTypeLabel =
    SOURCE_TYPE_LABELS[source.type] ?? source.type.split('_').join(' ').toUpperCase();
  return source.deleted ? `${sourceTypeLabel} (deleted)` : sourceTypeLabel;
}

export function getVendorRatingSourceHref(source: VendorRatingSource): string | null {
  if (source.deleted) return null;
  if (source.type === 'purchase_order') {
    return `/procurement/purchase-order/${source.id}`;
  }
  return null;
}
