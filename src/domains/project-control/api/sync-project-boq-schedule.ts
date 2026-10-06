import axios from '@/lib/axios';
import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import type { ApiResponse } from '@/types/api';

export interface SyncProjectBOQScheduleItemPayload {
  id: string | null;
  sortOrder: number;
  name: string;
  scheduleStartDate: string;
  scheduleEndDate: string;
}

export interface SyncProjectBOQSchedulePayload {
  items: SyncProjectBOQScheduleItemPayload[];
  deletedIds: string[];
}

export async function syncProjectBOQSchedule(
  projectId: string,
  payload: SyncProjectBOQSchedulePayload
): Promise<ApiResponse<null>> {
  try {
    const response = await axios.post<ApiResponse<null>>(
      getApiPath(`/projects/${projectId}/boq/items/sync`),
      payload
    );
    return response.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
