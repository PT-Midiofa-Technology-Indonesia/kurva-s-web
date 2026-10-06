'use client';

import { useMemo } from 'react';
import { useMe } from '@/domains/auth';
import type { SelectOption } from '@/shared/components/atoms';

export interface UseCompaniesInfiniteOptions {
  perPage?: number;
  enabled?: boolean;
  search?: string;
  isActive?: boolean;
}

export function useCompaniesInfinite(options?: UseCompaniesInfiniteOptions) {
  const search = options?.search ?? '';
  const isActive = options?.isActive;

  const { data: user, isLoading, error } = useMe();

  const companyOptions: SelectOption[] = useMemo(() => {
    if (!user?.companies) return [];

    let list = user.companies;

    // Client-side filter by isActive
    if (isActive !== undefined) {
      list = list.filter((c) => c.isActive === isActive);
    }

    // Client-side search by name
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((c) => c.name.toLowerCase().includes(q));
    }

    return list.map((c) => ({
      value: c.id,
      label: c.name,
    }));
  }, [user?.companies, search, isActive]);

  return {
    options: companyOptions,
    isLoading,
    hasMore: false,
    error: error ? (error as Error) : null,
    isFetchingNextPage: false,
    loadMore: () => {},
  };
}
