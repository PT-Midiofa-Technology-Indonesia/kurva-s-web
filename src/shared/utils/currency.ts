const IDR_FORMATTER = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

export function formatIDR(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return '';
  return IDR_FORMATTER.format(value);
}
