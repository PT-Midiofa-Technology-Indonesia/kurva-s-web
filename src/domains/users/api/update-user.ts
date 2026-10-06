import { handleApiError } from '@/lib/api-error';
import { getApiPath } from '@/shared/lib/api-config';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { CreateUserPayload, User } from '../types';

export type UpdateUserPayload = Partial<CreateUserPayload> & { password?: string };

export async function updateUser(userId: string, payload: UpdateUserPayload): Promise<User> {
  try {
    const { data } = await api.put<ApiSuccessResponse<User>>(
      getApiPath(`/users/${userId}`),
      payload
    );
    return data.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
