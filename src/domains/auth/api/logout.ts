import { handleApiError } from '@/lib/api-error';
import { api } from '@/lib/axios';
import { API_ENDPOINTS } from '@/shared/constants';
import { getApiPath } from '@/shared/lib/api-config';
import type { ApiSuccessResponse } from '@/types/api';

export async function logout(): Promise<void> {
  try {
    await api.post<ApiSuccessResponse<null>>(getApiPath(API_ENDPOINTS.AUTH.LOGOUT));
  } catch (error: unknown) {
    handleApiError(error);
  }
}
