import { useQuery } from '@tanstack/react-query';
import {
  type GetBOQItemsSuggestionsParams,
  getBOQItemsSuggestions,
} from '../api/get-boq-items-suggestions';

export const BOQ_ITEMS_SUGGESTIONS_QUERY_KEYS = {
  all: ['boq-items-suggestions'] as const,
  list: (params: GetBOQItemsSuggestionsParams) =>
    [...BOQ_ITEMS_SUGGESTIONS_QUERY_KEYS.all, params] as const,
};

export function useBOQItemsSuggestions(params: GetBOQItemsSuggestionsParams, enabled = true) {
  return useQuery({
    queryKey: BOQ_ITEMS_SUGGESTIONS_QUERY_KEYS.list(params),
    queryFn: () => getBOQItemsSuggestions(params),
    enabled: Boolean(params.projectId) && enabled,
    staleTime: 0,
  });
}
