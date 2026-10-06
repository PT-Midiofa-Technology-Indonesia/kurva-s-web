import { formatDateLong, formatDateTimeLong } from '@/shared/utils/format';
import type {
  EmployeeRatingScore,
  EmployeeRatingSource,
  EmployeeRatingSummaryCategory,
} from '../types';

const SOURCE_TYPE_LABELS: Record<string, string> = {
  project: 'Project',
};

export function formatEmployeeRatingValue(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '- / 5';
  }

  const formattedValue = value.toFixed(2).replace(/\.00$/, '');
  return `${formattedValue} / 5`;
}

export function formatEmployeeRatingDateTime(value: string | null | undefined): string {
  if (!value) return '-';

  const normalized = value.includes('T') ? value : value.replace(' ', 'T');
  return formatDateTimeLong(normalized);
}

export function formatEmployeeRatingDate(value: string | null | undefined): string {
  if (!value) return '-';

  const normalized = value.includes('T') ? value : value.replace(' ', 'T');
  return formatDateLong(normalized);
}

export function formatEmployeeRatingSummaryCategoryLabel(
  category: Pick<EmployeeRatingSummaryCategory, 'categoryId' | 'categoryName' | 'isActive'>
): string {
  if (category.isActive) return category.categoryName;

  return `${category.categoryName} ${category.categoryId ? '(inactive)' : '(deleted)'}`;
}

export function formatEmployeeRatingScoreLabel(
  score: Pick<EmployeeRatingScore, 'categoryName' | 'categoryStatus'>
): string {
  if (score.categoryStatus === 'active') return score.categoryName;

  return `${score.categoryName} (${score.categoryStatus})`;
}

export function formatEmployeeRatingSourceLabel(source: EmployeeRatingSource): string {
  if (source.label) return source.label;

  const sourceTypeLabel =
    SOURCE_TYPE_LABELS[source.type] ?? source.type.split('_').join(' ').toUpperCase();
  return source.deleted ? `${sourceTypeLabel} (deleted)` : sourceTypeLabel;
}

export function getEmployeeRatingSourceHref(source: EmployeeRatingSource): string | null {
  if (source.deleted) return null;

  if (source.type === 'project') {
    return `/project-control/project/${source.id}/boq`;
  }

  return null;
}
