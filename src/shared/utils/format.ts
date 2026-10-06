import { format, formatDistanceToNow, parse } from 'date-fns';
import { id } from 'date-fns/locale';

/** "05 Mar 2025" */
export function formatDate(value: string | Date): string {
  try {
    return format(new Date(value), 'dd MMM yyyy', { locale: id });
  } catch {
    return '-';
  }
}

/** "5 Maret 2025" — full Indonesian month name */
export function formatDateLong(value: string | Date): string {
  try {
    return format(new Date(value), 'd MMMM yyyy', { locale: id });
  } catch {
    return '-';
  }
}

/** "05 Mar 2025, 14:30" */
export function formatDateTime(value: string | Date): string {
  try {
    return format(new Date(value), 'dd MMM yyyy, HH:mm', { locale: id });
  } catch {
    return '-';
  }
}

/** "5 Maret 2025 14:30" — full Indonesian month name with time */
export function formatDateTimeLong(value: string | Date): string {
  try {
    return format(new Date(value), 'd MMMM yyyy HH:mm', { locale: id });
  } catch {
    return '-';
  }
}

/** UTC to indonesia time */
export function formatTime(value: string): string {
  try {
    const date = parse(value.substring(0, 19), "yyyy-MM-dd'T'HH:mm:ss", new Date());

    return format(date, 'HH:mm', { locale: id });
  } catch {
    return '-';
  }
}

export function formatFileSize(bytes?: number): string {
  if (!bytes) return '';
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Math.round((bytes / k ** i) * 10) / 10} ${sizes[i]}`;
}

/** Parse "yyyy-MM-dd" string to local-midnight Date (for date picker min/max) */
export function parseDateString(value: string): Date | undefined {
  try {
    const [y, m, d] = value.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return Number.isNaN(date.getTime()) ? undefined : date;
  } catch {
    return undefined;
  }
}

/** "Rp 1.500.000" — IDR currency */
export function formatCurrencyIDR(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '-';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);
}

/** "1.500.000" — locale number without currency symbol */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('id-ID').format(value);
}

/** "3 menit lalu" — relative time in Indonesian */
export function formatRelativeTime(date: string | Date): string {
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: id });
  } catch {
    return '-';
  }
}

/** "1 Jun 2026 16:00 WIB" — date time with timezone suffix */
export function formatDateTimeWithTz(date: string | Date): string {
  try {
    return `${format(new Date(date), 'd MMM yyyy HH:mm', { locale: id })} WIB`;
  } catch {
    return '-';
  }
}
