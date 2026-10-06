/**
 * Query Parameters Standard
 * All query parameters follow these conventions
 */

// ============================================================================
// Standard Pagination Parameters
// ============================================================================

export interface PaginationParams {
  page?: number;
  perPage?: number;
}

// ============================================================================
// Standard Sorting Parameters
// ============================================================================

export type SortOrder = 'asc' | 'desc';

export interface SortParams {
  sortBy?: string;
  sortOrder?: SortOrder;
}

// ============================================================================
// Standard Search Parameters
// ============================================================================

export interface SearchParams {
  search?: string;
}

// ============================================================================
// Base Query Parameters - Combine standard params with domain-specific filters
// ============================================================================

export interface BaseQueryParams extends PaginationParams, SortParams, SearchParams {
  [key: string]: string | number | boolean | undefined;
}

// ============================================================================
// Range Filter Helpers
// ============================================================================

/**
 * For numeric/value ranges: use From/To suffix
 * Example: { totalFrom: 100000, totalTo: 500000 }
 */
export interface RangeFilter {
  from?: number | string;
  to?: number | string;
}

/**
 * For time-based ranges: use After/Before suffix
 * Example: { createdAfter: '2026-01-01', createdBefore: '2026-01-31' }
 */
export interface DateRangeFilter {
  after?: string; // ISO 8601 date
  before?: string; // ISO 8601 date
}

// ============================================================================
// Multi-value Filter Helper
// ============================================================================

/**
 * For multiple values, use comma-separated string
 * Example: 'pending,paid,cancelled'
 * NOT: separate parameters like ?status=pending&status=paid
 */
export type MultiValueFilter = string; // comma-separated values

// ============================================================================
// Query Parameter Conventions
// ============================================================================

/**
 * NAMING CONVENTIONS:
 *
 * 1. CamelCase: Use camelCase for all parameter names
 *    ✅ sortBy, createdAfter, isActive
 *    ❌ sort_by, created_after, is_active
 *
 * 2. Standard Parameters: Reserved names across entire API
 *    - page: Page number (1-based)
 *    - perPage: Items per page
 *    - sortBy: Field to sort by
 *    - sortOrder: 'asc' or 'desc'
 *    - search: Free-text search
 *
 * 3. Range Filters:
 *    - Numeric: use From/To suffix
 *      Example: totalFrom=100000&totalTo=500000
 *    - Time-based: use After/Before suffix
 *      Example: createdAfter=2026-01-01&createdBefore=2026-01-31
 *
 * 4. Multi-value Filters:
 *    - Use comma-separated values
 *      Example: status=pending,paid,cancelled
 *    - NOT separate parameters
 *      ❌ Avoid: status=pending&status=paid
 *
 * 5. Boolean Values:
 *    - Use lowercase 'true' / 'false' strings
 *      Example: isActive=true
 *    - NOT numeric 1/0
 *      ❌ Avoid: isActive=1
 *
 * 6. Domain-Specific Parameters:
 *    - Follow same camelCase convention
 *    - Document in each domain's API
 */
