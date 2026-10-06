/**
 * Converts a string to Title Case.
 * Handles space-separated, snake_case, kebab-case, and camelCase inputs.
 */
export function toTitleCase(value: string | null | undefined): string {
  if (!value) return '-';

  return value
    .replace(/[-_]/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
