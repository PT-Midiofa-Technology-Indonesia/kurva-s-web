import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { ReadAllNotificationsResult } from '../types';

export async function readAllNotifications(): Promise<ReadAllNotificationsResult> {
  try {
    const { data } = await api.patch<ApiSuccessResponse<ReadAllNotificationsResult>>(
      getApiPath('/notifications/read-all')
    );
    return data.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
