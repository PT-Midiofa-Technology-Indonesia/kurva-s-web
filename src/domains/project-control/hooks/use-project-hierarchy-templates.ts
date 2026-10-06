import { useQuery } from '@tanstack/react-query';
import type { GetProjectHierarchyTemplatesParams } from '../api/get-project-hierarchy-templates';
import {
  getProjectHierarchyTemplateDetail,
  getProjectHierarchyTemplates,
} from '../api/get-project-hierarchy-templates';

export const PROJECT_HIERARCHY_TEMPLATES_QUERY_KEYS = {
  all: ['project-hierarchy-templates'] as const,
  list: (params?: GetProjectHierarchyTemplatesParams) =>
    [...PROJECT_HIERARCHY_TEMPLATES_QUERY_KEYS.all, 'list', params] as const,
  detail: (id: string) => [...PROJECT_HIERARCHY_TEMPLATES_QUERY_KEYS.all, 'detail', id] as const,
} as const;

export function useProjectHierarchyTemplates(params?: GetProjectHierarchyTemplatesParams) {
  return useQuery({
    queryKey: PROJECT_HIERARCHY_TEMPLATES_QUERY_KEYS.list(params),
    queryFn: () => getProjectHierarchyTemplates(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useProjectHierarchyTemplate(id: string) {
  return useQuery({
    queryKey: PROJECT_HIERARCHY_TEMPLATES_QUERY_KEYS.detail(id),
    queryFn: () => getProjectHierarchyTemplateDetail(id),
    enabled: !!id,
  });
}
