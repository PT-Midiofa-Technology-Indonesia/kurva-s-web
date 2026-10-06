'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { SelectOption } from '@/shared/components/atoms';
import { getProjectHierarchyTemplateNodesList } from '../api/get-project-hierarchy-template-nodes-list';

export const PROJECT_HIERARCHY_TEMPLATE_NODES_LIST_QUERY_KEY =
  'project-hierarchy-template-nodes-list';

interface UseProjectHierarchyTemplateNodesInfiniteOptions {
  templateId: string;
  perPage?: number;
  enabled?: boolean;
  search?: string;
}

export function useProjectHierarchyTemplateNodesInfinite(
  options: UseProjectHierarchyTemplateNodesInfiniteOptions
) {
  const { templateId, perPage = 10, enabled = true, search = '' } = options;

  const { data, isLoading, error, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: [PROJECT_HIERARCHY_TEMPLATE_NODES_LIST_QUERY_KEY, templateId, perPage, search],
      queryFn: ({ pageParam }) =>
        getProjectHierarchyTemplateNodesList(templateId, {
          page: pageParam,
          perPage,
          search: search || undefined,
        }),
      initialPageParam: 1,
      getNextPageParam: (lastPage) =>
        lastPage.meta?.currentPage < lastPage.meta?.lastPage
          ? lastPage.meta.currentPage + 1
          : undefined,
      enabled: !!templateId && enabled,
    });

  const hierarchyOptions: SelectOption[] = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) =>
      page.data.map((node) => ({
        value: node.positionId,
        label: `${node.position.code} - ${node.position.name}`,
      }))
    );
  }, [data?.pages]);

  return {
    options: hierarchyOptions,
    isLoading,
    hasMore: hasNextPage ?? false,
    error: error ? (error as Error) : null,
    isFetchingNextPage,
    loadMore: fetchNextPage,
  };
}
