'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { SelectOption } from '@/shared/components/atoms';
import { getProjectHierarchyNodesList } from '../api/get-project-hierarchy-nodes-list';

const PROJECT_HIERARCHY_NODES_LIST_QUERY_KEY = 'project-hierarchy-nodes-list';

interface UseProjectHierarchyNodesInfiniteOptions {
  projectId: string;
  perPage?: number;
  enabled?: boolean;
  search?: string;
  excludeNodeId?: string;
}

export function useProjectHierarchyNodesInfinite(options: UseProjectHierarchyNodesInfiniteOptions) {
  const { projectId, perPage = 10, enabled = true, search = '', excludeNodeId } = options;

  const { data, isLoading, error, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: [PROJECT_HIERARCHY_NODES_LIST_QUERY_KEY, projectId, perPage, search, excludeNodeId],
      queryFn: ({ pageParam }) =>
        getProjectHierarchyNodesList(projectId, {
          page: pageParam,
          perPage,
          search: search || undefined,
          excludeNodeId,
        }),
      initialPageParam: 1,
      getNextPageParam: (lastPage) =>
        lastPage.meta?.currentPage < lastPage.meta?.lastPage
          ? lastPage.meta.currentPage + 1
          : undefined,
      enabled: !!projectId && enabled,
    });

  const hierarchyOptions: SelectOption[] = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) =>
      page.data.map((node) => ({
        value: node.id,
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
