import { handleApiError } from '@/lib/api-error';
import { api } from '@/lib/axios';
import { API_ENDPOINTS } from '@/shared/constants';
import { getApiPath } from '@/shared/lib/api-config';
import type { ApiSuccessResponse } from '@/types/api';

import type { AuthTokenData, LoginCredentials } from '../types';

export async function login(credentials: LoginCredentials): Promise<AuthTokenData> {
  try {
    const { data } = await api.post<ApiSuccessResponse<AuthTokenData>>(
      getApiPath(API_ENDPOINTS.AUTH.LOGIN),
      {
        identity: credentials.identity,
        password: credentials.password,
        rememberMe: credentials.rememberMe ?? false,
      }
    );

    return data.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
