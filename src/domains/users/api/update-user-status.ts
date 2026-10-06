import { getApiPath } from '@/shared/lib/api-config';
import { api } from '@/shared/lib/axios';
import type { ApiResponse } from '@/types/api';

export interface UpdateUserStatusPayload {
  isActive: boolean;
}

export async function updateUserStatus(
  userId: string,
  payload: UpdateUserStatusPayload
): Promise<ApiResponse<any>> {
  const { data } = await api.put<ApiResponse<any>>(getApiPath(`/users/${userId}`), payload);
  return data;
}
