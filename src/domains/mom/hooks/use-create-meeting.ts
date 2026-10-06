import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MEETING_TASK_QUERY_KEYS } from '@/domains/action-item/hooks/use-meeting-tasks';
import { createMeeting } from '../api/create-meeting';
import type { MeetingPayload } from '../types/api';
import { MOM_QUERY_KEYS } from './use-meetings';

export function useCreateMeeting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ payload, companyId }: { payload: MeetingPayload; companyId: string }) =>
      createMeeting(payload, companyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MOM_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: MEETING_TASK_QUERY_KEYS.all });
    },
  });
}
