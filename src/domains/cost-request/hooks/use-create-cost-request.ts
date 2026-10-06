import { useMutation, useQueryClient } from '@tanstack/react-query';
import { type CreateCostRequestParams, createCostRequest } from '../api/create-cost-request';
import { COST_REQUEST_QUERY_KEYS } from './use-cost-requests';

export function useCreateCostRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: CreateCostRequestParams) => createCostRequest(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COST_REQUEST_QUERY_KEYS.lists() });
    },
  });
}
