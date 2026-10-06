import { useInfiniteQuery } from '@tanstack/react-query';
import type { SelectOption } from '@/shared/components/atoms';
import { getProjectHierarchyTemplates } from '../api/get-project-hierarchy-templates';
import { PROJECT_HIERARCHY_TEMPLATES_QUERY_KEYS } from './use-project-hierarchy-templates';

export function useProjectHierarchyTemplatesInfinite(search?: string) {
  return useInfiniteQuery({
    queryKey: [...PROJECT_HIERARCHY_TEMPLATES_QUERY_KEYS.all, 'infinite', search],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await getProjectHierarchyTemplates({
        page: pageParam,
        perPage: 20,
        search,
        isActive: true,
      });
      return res;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (!lastPage?.meta) return undefined;
      const { currentPage, lastPage: last } = lastPage.meta;
      return currentPage < last ? currentPage + 1 : undefined;
    },
    select: (data) => {
      const options: SelectOption[] = [];
      for (const page of data.pages) {
        if (!page?.data) continue;
        for (const item of page.data) {
          options.push({ label: item.name, value: item.id });
        }
      }
      const lastMeta = data.pages[data.pages.length - 1]?.meta;
      const hasMore = lastMeta ? lastMeta.currentPage < lastMeta.lastPage : false;
      return { options, hasMore };
    },
  });
}
