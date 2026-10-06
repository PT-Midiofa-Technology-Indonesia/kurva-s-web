'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { SelectOption } from '@/shared/components/atoms';
import { getSkillLevels } from '../api/get-skill-levels';
import { SKILL_LEVEL_QUERY_KEYS } from './use-skill-levels';

export interface UseSkillLevelsInfiniteOptions {
  perPage?: number;
  enabled?: boolean;
  search?: string;
  isActive?: boolean;
}

export function useSkillLevelsInfinite(options?: UseSkillLevelsInfiniteOptions) {
  const perPage = options?.perPage ?? 10;
  const search = options?.search ?? '';

  const { data, isLoading, error, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: [...SKILL_LEVEL_QUERY_KEYS.infinite(), perPage, search, options?.isActive],
      queryFn: ({ pageParam }) =>
        getSkillLevels({
          page: pageParam,
          perPage,
          search: search || undefined,
          isActive: options?.isActive,
        }),
      initialPageParam: 1,
      getNextPageParam: (lastPage) =>
        lastPage.meta.currentPage < lastPage.meta.lastPage
          ? lastPage.meta.currentPage + 1
          : undefined,
      enabled: options?.enabled !== false,
    });

  const skillLevelOptions: SelectOption[] = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) =>
      page.data.map((sl) => ({
        value: sl.id,
        label: sl.name,
      }))
    );
  }, [data?.pages]);

  return {
    options: skillLevelOptions,
    isLoading,
    hasMore: hasNextPage ?? false,
    error: error ? (error as Error) : null,
    isFetchingNextPage,
    loadMore: fetchNextPage,
  };
}
