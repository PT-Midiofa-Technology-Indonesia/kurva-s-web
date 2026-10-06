/**
 * Phone number mask — strips non-digits, limits max digits.
 * The `+62` prefix is shown visually via the form field `prefix` prop.
 * The 62 normalization is handled by the phone schema transform.
 */
export function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';

  return digits.slice(0, 15);
}

/**
 * Strip Indonesian phone prefix (62, +62, 08) so the value matches what the
 * user types into the form (the `+62` prefix is shown visually via the
 * form field `prefix` prop). Used when seeding defaultValues in edit mode.
 *
 * Examples:
 *   "6281234567890"   → "8123456789"
 *   "+6281234567890"  → "8123456789"
 *   "081234567890"    → "8123456789"
 *   "8123456789"      → "8123456789"
 */
export function stripPhonePrefix(value: string | null | undefined): string {
  if (!value) return '';
  const digits = value.replace(/\D/g, '');
  if (digits.startsWith('62')) return digits.slice(2);
  if (digits.startsWith('0')) return digits.slice(1);
  return digits;
}

/**
 * Remove all whitespace from a value. Use as a `mask` on text/password
 * fields where spaces are never valid (email, password, etc.).
 *
 * Example:
 *   "  user @example.com  " → "user@example.com"
 *   "my pass 123"           → "mypass123"
 */
export function noWhitespace(value: string): string {
  return value.replace(/\s+/g, '');
}

/**
 * Format phone for display — adds + prefix for readability.
 * Examples:
 *   "6281234567890" → "+6281234567890"
 *   "+6281234567890" → "+6281234567890"
 */
export function formatPhone(phone: string | undefined | null): string {
  if (!phone) return '';
  if (phone.startsWith('+')) return phone;
  if (phone.startsWith('62')) return `+${phone}`;
  return phone;
}

/**
 * Indonesian NPWP mask — formats to ##.###.###.#-###.###
 * Example: "123456789012345" → "12.345.678.9-012.345"
 */
export function maskNpwp(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 15);
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  if (digits.length <= 9)
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}.${digits.slice(8)}`;
  if (digits.length <= 12)
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}.${digits.slice(8, 9)}-${digits.slice(9)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}.${digits.slice(8, 9)}-${digits.slice(9, 12)}.${digits.slice(12)}`;
}

/**
 * Numeric-only mask with max length.
 * Example: maskDigits("abc12345", 5) → "12345"
 */
export function maskDigits(value: string, maxLength: number): string {
  return value.replace(/\D/g, '').slice(0, maxLength);
}

/**
 * Max character length mask factory.
 * Example: maxChars(50)("hello world") → "hello world" (unchanged if ≤50 chars)
 */
export function maxChars(max: number): (value: string) => string {
  return (value: string) => value.slice(0, max);
}
