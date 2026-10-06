import { handleApiError } from '@/lib/api-error';
import { api } from '@/lib/axios';
import { API_ENDPOINTS } from '@/shared/constants';
import { getApiPath } from '@/shared/lib/api-config';
import type { ApiSuccessResponse } from '@/types/api';

import type { AuthTokenData } from '../types';

export async function refreshToken(): Promise<AuthTokenData> {
  try {
    const { data } = await api.post<ApiSuccessResponse<AuthTokenData>>(
      getApiPath(API_ENDPOINTS.AUTH.REFRESH_TOKEN)
    );
    return data.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
