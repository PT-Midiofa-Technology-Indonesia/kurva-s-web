import { useMutation, useQueryClient } from '@tanstack/react-query';
import { type UpdateDueDatePayload, updateDueDate } from '../api/update-due-date';
import { PAYMENT_REQUEST_QUERY_KEYS } from './use-payment-requests';

export function useUpdateDueDate(paymentRequestId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateDueDatePayload) => updateDueDate(paymentRequestId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: PAYMENT_REQUEST_QUERY_KEYS.detail(paymentRequestId),
      });
    },
  });
}
