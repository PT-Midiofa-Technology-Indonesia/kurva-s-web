import { useQuery } from '@tanstack/react-query';
import { type GetBOQTemplatesParams, getBOQTemplates } from '../api';

export const BOQ_TEMPLATES_QUERY_KEYS = {
  all: ['boq-templates'] as const,
  list: (params?: GetBOQTemplatesParams) =>
    [...BOQ_TEMPLATES_QUERY_KEYS.all, 'list', params] as const,
} as const;

export function useBOQTemplates(params?: GetBOQTemplatesParams) {
  return useQuery({
    queryKey: BOQ_TEMPLATES_QUERY_KEYS.list(params),
    queryFn: () => getBOQTemplates(params),
    placeholderData: (previousData) => previousData,
    staleTime: 0,
    refetchOnMount: 'always',
  });
}
