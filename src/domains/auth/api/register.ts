import { handleApiError } from '@/lib/api-error';
import { api } from '@/lib/axios';
import { API_ENDPOINTS } from '@/shared/constants';
import { getApiPath } from '@/shared/lib/api-config';
import type { ApiSuccessResponse } from '@/types/api';

import type { RegisterResponse } from '../types';

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export async function register(payload: RegisterPayload): Promise<RegisterResponse> {
  try {
    const { data } = await api.post<ApiSuccessResponse<RegisterResponse>>(
      getApiPath(API_ENDPOINTS.AUTH.REGISTER),
      payload
    );
    return data.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
