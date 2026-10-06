import { useQuery } from '@tanstack/react-query';
import {
  type GetBOQTemplateItemsSuggestionsParams,
  getBOQTemplateItemsSuggestions,
} from '../api/get-boq-template-items-suggestions';

export const BOQ_TEMPLATE_ITEMS_SUGGESTIONS_QUERY_KEYS = {
  all: ['boq-template-items-suggestions'] as const,
  list: (params: GetBOQTemplateItemsSuggestionsParams) =>
    [...BOQ_TEMPLATE_ITEMS_SUGGESTIONS_QUERY_KEYS.all, params] as const,
};

export function useBOQTemplateItemsSuggestions(
  params: GetBOQTemplateItemsSuggestionsParams,
  enabled = true
) {
  return useQuery({
    queryKey: BOQ_TEMPLATE_ITEMS_SUGGESTIONS_QUERY_KEYS.list(params),
    queryFn: () => getBOQTemplateItemsSuggestions(params),
    enabled: Boolean(params.boqTemplateId) && enabled,
    staleTime: 0,
  });
}
