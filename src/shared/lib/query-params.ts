/**
 * Query Parameters Utilities
 * Helpers for building and validating query parameters
 */

import type { SortOrder } from '@/types/query-params';

// ============================================================================
// Query Parameter Building
// ============================================================================

/**
 * Build query parameters object, filtering out undefined/null values
 * Ensures consistent parameter naming and structure
 *
 * @example
 * buildQueryParams({
 *   page: 1,
 *   perPage: 20,
 *   sortBy: 'createdAt',
 *   sortOrder: 'desc',
 *   search: 'invoice',
 *   status: 'pending,paid'
 * })
 */
export function buildQueryParams<T extends Record<string, any>>(params: T): Partial<T> {
  const result: Record<string, any> = {};

  for (const [key, value] of Object.entries(params)) {
    // Skip undefined and null values
    if (value === undefined || value === null) {
      continue;
    }

    // Skip empty strings
    if (typeof value === 'string' && value === '') {
      continue;
    }

    // Include all other values
    result[key] = value;
  }

  return result as Partial<T>;
}

// ============================================================================
// Pagination Helpers
// ============================================================================

/**
 * Validate page number (must be >= 1)
 */
export function isValidPage(page: any): page is number {
  return typeof page === 'number' && page >= 1 && Number.isInteger(page);
}

/**
 * Validate perPage (must be between 1 and max, default max is 100)
 */
export function isValidPerPage(perPage: any, maxPerPage: number = 100): perPage is number {
  return (
    typeof perPage === 'number' &&
    perPage >= 1 &&
    perPage <= maxPerPage &&
    Number.isInteger(perPage)
  );
}

/**
 * Ensure page is valid, default to 1
 */
export function normalizePage(page: any): number {
  return isValidPage(page) ? page : 1;
}

/**
 * Ensure perPage is valid, default to 20, max to 100
 */
export function normalizePerPage(
  perPage: any,
  defaultPerPage: number = 20,
  maxPerPage: number = 100
): number {
  if (isValidPerPage(perPage, maxPerPage)) {
    return perPage;
  }
  return Math.min(defaultPerPage, maxPerPage);
}

// ============================================================================
// Sorting Helpers
// ============================================================================

/**
 * Validate sort order
 */
export function isValidSortOrder(sortOrder: any): sortOrder is SortOrder {
  return sortOrder === 'asc' || sortOrder === 'desc';
}

/**
 * Ensure sortOrder is valid, default to 'asc'
 */
export function normalizeSortOrder(sortOrder: any, defaultOrder: SortOrder = 'asc'): SortOrder {
  return isValidSortOrder(sortOrder) ? sortOrder : defaultOrder;
}

/**
 * Validate sortBy is not empty
 */
export function isValidSortBy(sortBy: any): sortBy is string {
  return typeof sortBy === 'string' && sortBy.trim() !== '';
}

// ============================================================================
// Multi-value Filter Helpers
// ============================================================================

/**
 * Parse comma-separated values into array
 *
 * @example
 * parseMultiValue('pending,paid,cancelled')
 * // Returns: ['pending', 'paid', 'cancelled']
 */
export function parseMultiValue(value: string | undefined): string[] {
  if (!value || typeof value !== 'string') {
    return [];
  }
  return value
    .split(',')
    .map((v) => v.trim())
    .filter((v) => v !== '');
}

/**
 * Join array values into comma-separated string
 *
 * @example
 * formatMultiValue(['pending', 'paid'])
 * // Returns: 'pending,paid'
 */
export function formatMultiValue(values: string[]): string {
  return values.join(',');
}

// ============================================================================
// Boolean Helpers
// ============================================================================

/**
 * Parse boolean string value
 * Accepts: 'true', 'false' (case-insensitive)
 *
 * @example
 * parseBoolean('true') // Returns: true
 * parseBoolean('false') // Returns: false
 * parseBoolean('invalid') // Returns: undefined
 */
export function parseBoolean(value: any): boolean | undefined {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'string') {
    const lower = value.toLowerCase();
    if (lower === 'true') return true;
    if (lower === 'false') return false;
  }
  return undefined;
}

/**
 * Format boolean to lowercase string for query params
 *
 * @example
 * formatBoolean(true) // Returns: 'true'
 * formatBoolean(false) // Returns: 'false'
 */
export function formatBoolean(value: boolean): string {
  return value ? 'true' : 'false';
}

// ============================================================================
// Date Range Helpers
// ============================================================================

/**
 * Validate ISO 8601 date format (YYYY-MM-DD)
 */
export function isValidIsoDate(date: any): date is string {
  if (typeof date !== 'string') return false;
  // Simple validation - checks format YYYY-MM-DD
  return /^\d{4}-\d{2}-\d{2}$/.test(date);
}

/**
 * Format Date object to ISO string (YYYY-MM-DD)
 */
export function formatDateToIso(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Parse ISO date string to Date object
 */
export function parseIsoDate(dateString: string): Date | undefined {
  if (!isValidIsoDate(dateString)) return undefined;
  return new Date(dateString);
}

// ============================================================================
// Query Parameter Serialization
// ============================================================================

/**
 * Convert query params object to URL search params string
 *
 * @example
 * serializeQueryParams({ page: 1, search: 'test', sortBy: 'name' })
 * // Returns: 'page=1&search=test&sortBy=name'
 */
export function serializeQueryParams(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    if (typeof value === 'string' && value === '') continue;

    searchParams.append(key, String(value));
  }

  return searchParams.toString();
}

/**
 * Create full query string with ? prefix
 *
 * @example
 * createQueryString({ page: 1, search: 'test' })
 * // Returns: '?page=1&search=test'
 */
export function createQueryString(params: Record<string, any>): string {
  const serialized = serializeQueryParams(params);
  return serialized ? `?${serialized}` : '';
}

// ============================================================================
// Example Usage Patterns
// ============================================================================

/**
 * Example: Building query params for API call
 *
 * ```typescript
 * import { buildQueryParams, normalizePage, normalizePerPage } from '@/lib/query-params';
 *
 * const params = buildQueryParams({
 *   page: normalizePage(req.page),
 *   perPage: normalizePerPage(req.perPage),
 *   sortBy: 'createdAt',
 *   sortOrder: normalizeSortOrder(req.sortOrder),
 *   search: req.search,
 *   status: formatMultiValue(['pending', 'paid']),
 * });
 *
 * const { data } = await api.get('/v1/orders', { params });
 * ```
 */

/**
 * Example: Parsing multi-value filter from query params
 *
 * ```typescript
 * import { parseMultiValue } from '@/lib/query-params';
 *
 * const statusFilter = parseMultiValue(queryParams.status);
 * // statusFilter = ['pending', 'paid']
 * ```
 */

/**
 * Example: Handling boolean query params
 *
 * ```typescript
 * import { parseBoolean, formatBoolean } from '@/lib/query-params';
 *
 * // From query string
 * const isActive = parseBoolean(queryParams.isActive);
 *
 * // To query string
 * const queryParam = formatBoolean(true); // 'true'
 * ```
 */
