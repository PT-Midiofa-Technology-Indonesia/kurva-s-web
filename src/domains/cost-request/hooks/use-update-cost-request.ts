import { useMutation, useQueryClient } from '@tanstack/react-query';
import { type UpdateCostRequestParams, updateCostRequest } from '../api/update-cost-request';
import { COST_REQUEST_QUERY_KEYS } from './use-cost-requests';

export function useUpdateCostRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: UpdateCostRequestParams) => updateCostRequest(params),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: COST_REQUEST_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: COST_REQUEST_QUERY_KEYS.detail(data.id) });
    },
  });
}
