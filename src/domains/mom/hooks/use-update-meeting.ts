import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MEETING_TASK_QUERY_KEYS } from '@/domains/action-item/hooks/use-meeting-tasks';
import { updateMeeting } from '../api/update-meeting';
import type { MeetingPayload } from '../types/api';
import { MOM_QUERY_KEYS } from './use-meetings';

export function useUpdateMeeting(id: string, companyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: MeetingPayload) => updateMeeting(id, payload, companyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MOM_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: MOM_QUERY_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: MEETING_TASK_QUERY_KEYS.all });
    },
  });
}
