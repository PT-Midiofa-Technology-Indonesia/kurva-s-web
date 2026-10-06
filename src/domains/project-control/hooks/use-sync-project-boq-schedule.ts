import { useMutation, useQueryClient } from '@tanstack/react-query';
import { TOAST_MESSAGES } from '@/shared/constants/toast-messages';
import { getErrorMessage } from '@/shared/lib/api-error';
import { toast } from '@/shared/lib/toast';
import {
  type SyncProjectBOQSchedulePayload,
  syncProjectBOQSchedule,
} from '../api/sync-project-boq-schedule';
import { PROJECT_BOQ_QUERY_KEYS } from './use-project-boq';

export function useSyncProjectBOQSchedule(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SyncProjectBOQSchedulePayload) =>
      syncProjectBOQSchedule(projectId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: PROJECT_BOQ_QUERY_KEYS.detail(projectId),
      });
      toast.success({ title: TOAST_MESSAGES.SUCCESS.UPDATED('Jadwal Project') });
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error({ title: message });
    },
  });
}
