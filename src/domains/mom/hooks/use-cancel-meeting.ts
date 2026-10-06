import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MEETING_TASK_QUERY_KEYS } from '@/domains/action-item/hooks/use-meeting-tasks';
import { cancelMeeting } from '../api/cancel-meeting';
import { MOM_QUERY_KEYS } from './use-meetings';

export function useCancelMeeting(id: string, companyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reason: string) => cancelMeeting(id, reason, companyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MOM_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: MOM_QUERY_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: MEETING_TASK_QUERY_KEYS.all });
    },
  });
}
