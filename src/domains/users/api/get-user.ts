import type { AxiosError } from 'axios';
import { getApiPath } from '@/shared/lib/api-config';
import { api } from '@/shared/lib/axios';
import type { ApiResponse } from '@/types/api';
import type { UserDetail } from '../types';

export type GetUserResponse = ApiResponse<UserDetail>;

export async function getUser(userId: string): Promise<GetUserResponse | null> {
  try {
    const { data } = await api.get<ApiResponse<UserDetail>>(getApiPath(`/users/${userId}`));
    return data;
  } catch (error: unknown) {
    if ((error as AxiosError)?.response?.status === 404) {
      return null;
    }
    throw error;
  }
}
