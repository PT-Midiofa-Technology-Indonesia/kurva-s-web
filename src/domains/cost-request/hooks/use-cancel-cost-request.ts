import { useMutation, useQueryClient } from '@tanstack/react-query';
import { type CancelCostRequestParams, cancelCostRequest } from '../api/cancel-cost-request';
import { COST_REQUEST_QUERY_KEYS } from './use-cost-requests';

export function useCancelCostRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: CancelCostRequestParams) => cancelCostRequest(params),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: COST_REQUEST_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: COST_REQUEST_QUERY_KEYS.detail(data.id) });
    },
  });
}
