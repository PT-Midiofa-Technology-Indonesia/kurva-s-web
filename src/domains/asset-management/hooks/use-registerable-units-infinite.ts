'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { SelectOption } from '@/shared/components/atoms';
import { getRegisterableUnits } from '../api/get-registerable-units';
import { ASSET_REGISTRATION_QUERY_KEYS } from './use-asset-registrations';

export interface UseRegisterableUnitsInfiniteOptions {
  companyId?: string | null;
  perPage?: number;
  enabled?: boolean;
  search?: string;
  showAll?: boolean;
  warehouseId?: string;
}

export function useRegisterableUnitsInfinite(options?: UseRegisterableUnitsInfiniteOptions) {
  const search = options?.search ?? '';
  const companyId = options?.companyId ?? undefined;

  const { data, isLoading, error } = useQuery({
    queryKey: [
      ...ASSET_REGISTRATION_QUERY_KEYS.registerableUnits(),
      companyId,
      search,
      options?.showAll,
      options?.warehouseId,
    ],
    queryFn: () =>
      getRegisterableUnits({
        companyId,
        search: search || undefined,
        showAll: options?.showAll,
        warehouseId: options?.warehouseId,
      }),
    enabled: (options?.enabled ?? true) && !!companyId,
  });

  const unitOptions: SelectOption[] = useMemo(() => {
    if (!data?.data) return [];
    return data.data.map((unit) => ({
      value: unit.id,
      label: `${unit.unitCode} - ${unit.itemName}`,
    }));
  }, [data?.data]);

  return {
    options: unitOptions,
    items: data?.data ?? [],
    isLoading,
    hasMore: false,
    error: error ? (error as Error) : null,
    isFetchingNextPage: false,
    loadMore: () => {},
  };
}
