import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiPaginatedResponse } from '@/types/api';
import type { GetNotificationsParams, NotificationItem, NotificationListResult } from '../types';

interface NotificationsEnvelope extends ApiPaginatedResponse<NotificationItem[]> {
  unreadCount: number;
}

export async function getNotifications(
  params: GetNotificationsParams = {}
): Promise<NotificationListResult> {
  try {
    const { data } = await api.get<NotificationsEnvelope>(getApiPath('/notifications'), {
      params: {
        filter: params.filter ?? 'all',
        page: params.page,
        perPage: params.perPage,
      },
    });
    return { items: data.data, meta: data.meta, unreadCount: data.unreadCount };
  } catch (error: unknown) {
    handleApiError(error);
  }
}
