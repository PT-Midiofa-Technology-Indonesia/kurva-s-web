import { useCallback } from 'react';
import { useQueryParams } from './use-query-params';

export interface FilterParamsConfig {
  [key: string]: 'string' | 'number' | 'date' | 'boolean' | 'array';
}

interface UseFilterParamsOptions {
  defaultPage?: number;
}

/**
 * Hook for managing filter parameters in URL.
 * Extends useQueryParams to provide filter-specific utilities.
 *
 * Usage:
 * ```tsx
 * const { filterParams, applyFilters, resetFilters } = useFilterParams<FilterType>({
 *   defaultPage: 1,
 * });
 *
 * // Apply filter form data to URL
 * const handleApplyFilter = (formData: FilterType) => {
 *   applyFilters(formData);
 * };
 * ```
 */
export function useFilterParams<T extends Record<string, any>>(options?: UseFilterParamsOptions) {
  const { queryParams, setQueryParams, updateQueryParam } = useQueryParams<any>();
  const { defaultPage = 1 } = options || {};

  const applyFilters = useCallback(
    (filterData: Partial<T>) => {
      const params: Record<string, string | undefined> = {};

      Object.entries(filterData).forEach(([key, value]) => {
        if (value === null || value === undefined || value === '') {
          params[key] = undefined;
        } else if (typeof value === 'boolean') {
          params[key] = value ? 'true' : 'false';
        } else if (value instanceof Date) {
          params[key] = value.toISOString();
        } else if (Array.isArray(value)) {
          params[key] = value.length > 0 ? value.join(',') : undefined;
        } else {
          params[key] = String(value);
        }
      });

      // Reset to page 1 when filters change, preserve pagination params if not filtering
      setQueryParams({
        ...params,
        page: String(defaultPage),
      } as any);
    },
    [setQueryParams, defaultPage]
  );

  const resetFilters = useCallback(() => {
    setQueryParams({
      page: String(defaultPage),
    } as any);
  }, [setQueryParams, defaultPage]);

  const getTypedFilterParams = useCallback(() => {
    const typed: Partial<T> = {};
    const { page, ...filterParams } = queryParams;

    Object.entries(filterParams).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        typed[key as keyof T] = value as any;
      }
    });

    return typed;
  }, [queryParams]);

  return {
    filterParams: queryParams as Partial<T> & { page?: string },
    applyFilters,
    resetFilters,
    updateFilterParam: updateQueryParam,
    getTypedFilterParams,
    currentPage: queryParams?.page ? parseInt(queryParams.page, 10) : defaultPage,
  };
}
