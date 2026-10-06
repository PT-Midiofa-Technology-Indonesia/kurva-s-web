import { handleApiError } from '@/lib/api-error';
import { api } from '@/lib/axios';
import { API_ENDPOINTS } from '@/shared/constants';
import { getApiPath } from '@/shared/lib/api-config';
import type { ApiSuccessResponse } from '@/types/api';

import type { User } from '../types';

export async function getMe(): Promise<User> {
  try {
    const { data } = await api.get<ApiSuccessResponse<User>>(getApiPath(API_ENDPOINTS.AUTH.ME));
    return data.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
