'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useMemo, useRef } from 'react';

import type { BaseQueryParams } from '@/types/query-params';

// ─── Pure helper ──────────────────────────────────────────────────────────────

function parseSearchParams(sp: URLSearchParams): Record<string, any> {
  const params: Record<string, any> = {};

  const page = sp.get('page');
  const perPage = sp.get('perPage');
  const sortBy = sp.get('sortBy');
  const sortOrder = sp.get('sortOrder');
  const search = sp.get('search');

  if (page) params.page = parseInt(page, 10);
  if (perPage) params.perPage = parseInt(perPage, 10);
  if (sortBy) params.sortBy = sortBy;
  if (sortOrder) params.sortOrder = sortOrder;
  if (search) params.search = search;

  // Include all custom/domain-specific params (e.g. isActive, status)
  sp.forEach((value, key) => {
    if (!['page', 'perPage', 'sortBy', 'sortOrder', 'search'].includes(key)) {
      params[key] = value;
    }
  });

  return params;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useQueryParams<T extends BaseQueryParams = BaseQueryParams>() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Ref always holds the latest searchParams — callbacks read from this
  // instead of closing over a potentially stale value.
  const searchParamsRef = useRef(searchParams);
  searchParamsRef.current = searchParams;

  // Parsed object — re-derived whenever the URL changes
  const queryParams = useMemo<T>(() => parseSearchParams(searchParams) as T, [searchParams]);

  const buildUrl = useCallback(
    (params: Record<string, any>): string => {
      const sp = new URLSearchParams();

      Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') return;
        sp.set(key, String(value));
      });

      const qs = sp.toString();
      return qs ? `${pathname}?${qs}` : pathname;
    },
    [pathname]
  );

  const pushQueryState = useCallback((url: string) => {
    window.history.pushState({}, '', url);
  }, []);

  /** Update one param; pass `undefined` to remove it */
  const updateQueryParam = useCallback(
    (key: keyof T, value: T[keyof T] | undefined) => {
      const current = parseSearchParams(searchParamsRef.current);

      if (value === undefined) {
        delete current[key as string];
      } else {
        current[key as string] = value;
      }

      pushQueryState(buildUrl(current));
    },
    [buildUrl, pushQueryState]
  );

  /** Update (or remove) multiple params at once */
  const setQueryParams = useCallback(
    (updates: Partial<T>) => {
      const current = parseSearchParams(searchParamsRef.current);

      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined) {
          delete current[key];
        } else {
          current[key] = value;
        }
      });

      pushQueryState(buildUrl(current));
    },
    [buildUrl, pushQueryState]
  );

  /** Clear every param */
  const resetQueryParams = useCallback(() => {
    pushQueryState(pathname);
  }, [pathname, pushQueryState]);

  /** Clear specific params */
  const resetQueryParam = useCallback(
    (...keys: (keyof T)[]) => {
      const current = parseSearchParams(searchParamsRef.current);
      keys.forEach((key) => {
        delete current[key as string];
      });
      pushQueryState(buildUrl(current));
    },
    [buildUrl, pushQueryState]
  );

  /** Replace entire query state (drops params not in `params`) */
  const replaceQueryParams = useCallback(
    (params: Partial<T>) => {
      pushQueryState(buildUrl(params as Record<string, unknown>));
    },
    [buildUrl, pushQueryState]
  );

  return {
    queryParams,
    setQueryParams,
    updateQueryParam,
    resetQueryParams,
    resetQueryParam,
    replaceQueryParams,
  };
}
