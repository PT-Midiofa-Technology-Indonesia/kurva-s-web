'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { SelectOption } from '@/shared/components/atoms';
import { getSkillCatalogs } from '../api/get-skill-catalogs';
import type { SkillCatalogListItem } from '../types';
import { SKILL_CATALOG_QUERY_KEYS } from './use-skill-catalogs';

export interface UseSkillCatalogsInfiniteOptions {
  perPage?: number;
  enabled?: boolean;
  search?: string;
  isActive?: boolean;
  skillLevelId?: string;
  skillCategoryId?: string;
}

export function useSkillCatalogsInfinite(options?: UseSkillCatalogsInfiniteOptions) {
  const perPage = options?.perPage ?? 10;
  const search = options?.search ?? '';

  const { data, isLoading, error, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: [
        ...SKILL_CATALOG_QUERY_KEYS.infinite(),
        perPage,
        search,
        options?.isActive,
        options?.skillLevelId,
        options?.skillCategoryId,
      ],
      queryFn: ({ pageParam }) =>
        getSkillCatalogs({
          page: pageParam,
          perPage,
          search: search || undefined,
          isActive: options?.isActive,
          skillLevelId: options?.skillLevelId,
          skillCategoryId: options?.skillCategoryId,
        }),
      initialPageParam: 1,
      getNextPageParam: (lastPage) =>
        lastPage.meta.currentPage < lastPage.meta.lastPage
          ? lastPage.meta.currentPage + 1
          : undefined,
      enabled: options?.enabled !== false,
    });

  const items: SkillCatalogListItem[] = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.data);
  }, [data?.pages]);

  const skillCatalogOptions: SelectOption[] = useMemo(
    () =>
      items.map((sc) => ({
        value: sc.id,
        label: `${sc.code} - ${sc.name}`,
      })),
    [items]
  );

  return {
    options: skillCatalogOptions,
    items,
    isLoading,
    hasMore: hasNextPage ?? false,
    error: error ? (error as Error) : null,
    isFetchingNextPage,
    loadMore: fetchNextPage,
  };
}
