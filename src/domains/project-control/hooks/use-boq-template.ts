import { useQuery } from '@tanstack/react-query';
import { getBOQTemplate } from '../api';

export const BOQ_TEMPLATE_QUERY_KEYS = {
  all: ['boq-template'] as const,
  detail: (id: string) => [...BOQ_TEMPLATE_QUERY_KEYS.all, 'detail', id] as const,
} as const;

export function useBOQTemplate(id: string) {
  return useQuery({
    queryKey: BOQ_TEMPLATE_QUERY_KEYS.detail(id),
    queryFn: () => getBOQTemplate(id),
    enabled: !!id,
  });
}
