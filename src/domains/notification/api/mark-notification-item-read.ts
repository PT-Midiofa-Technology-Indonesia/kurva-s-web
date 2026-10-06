import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { MarkNotificationItemReadResult, NotificationItem } from '../types';

interface MarkNotificationItemReadEnvelope extends ApiSuccessResponse<NotificationItem> {
  unreadCount: number;
}

export async function markNotificationItemRead(
  notificationId: string
): Promise<MarkNotificationItemReadResult> {
  try {
    const { data } = await api.patch<MarkNotificationItemReadEnvelope>(
      getApiPath(`/notifications/${notificationId}/read`)
    );
    return { notification: data.data, unreadCount: data.unreadCount };
  } catch (error: unknown) {
    handleApiError(error);
  }
}
