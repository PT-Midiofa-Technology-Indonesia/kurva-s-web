/**
 * Indonesian time zones follow provincial borders rather than meridians, so the
 * abbreviation cannot be derived from coordinates — the backend sends the IANA
 * name and this only puts a familiar label on it.
 */
const TIMEZONE_ABBREVIATIONS: Record<string, string> = {
  'Asia/Jakarta': 'WIB',
  'Asia/Makassar': 'WITA',
  'Asia/Jayapura': 'WIT',
};

/** `"Asia/Makassar"` → `"WITA (Asia/Makassar)"`, or the raw name when unknown. */
export function formatTimezone(timezone: string | null | undefined): string | null {
  if (!timezone) return null;

  const abbreviation = TIMEZONE_ABBREVIATIONS[timezone];
  return abbreviation ? `${abbreviation} (${timezone})` : timezone;
}
