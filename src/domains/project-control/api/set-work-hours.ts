import axios from '@/lib/axios';
import { getApiPath } from '@/shared/lib/api-config';

interface SetWorkHoursPayload {
  workStartTime: string;
  workEndTime: string;
  workDays: string[];
}

export async function setWorkHours(projectId: string, payload: SetWorkHoursPayload): Promise<void> {
  await axios.patch(getApiPath(`/projects/${projectId}/work-hours`), payload);
}

export type { SetWorkHoursPayload };
