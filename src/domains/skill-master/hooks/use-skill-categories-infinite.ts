'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { SelectOption } from '@/shared/components/atoms';
import { getSkillCategories } from '../api/get-skill-categories';
import { SKILL_CATEGORY_QUERY_KEYS } from './use-skill-categories';

export interface UseSkillCategoriesInfiniteOptions {
  perPage?: number;
  enabled?: boolean;
  search?: string;
  isActive?: boolean;
}

export function useSkillCategoriesInfinite(options?: UseSkillCategoriesInfiniteOptions) {
  const perPage = options?.perPage ?? 10;
  const search = options?.search ?? '';

  const { data, isLoading, error, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: [...SKILL_CATEGORY_QUERY_KEYS.infinite(), perPage, search, options?.isActive],
      queryFn: ({ pageParam }) =>
        getSkillCategories({
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

  const skillCategoryOptions: SelectOption[] = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) =>
      page.data.map((sc) => ({
        value: sc.id,
        label: sc.name,
      }))
    );
  }, [data?.pages]);

  return {
    options: skillCategoryOptions,
    isLoading,
    hasMore: hasNextPage ?? false,
    error: error ? (error as Error) : null,
    isFetchingNextPage,
    loadMore: fetchNextPage,
  };
}
