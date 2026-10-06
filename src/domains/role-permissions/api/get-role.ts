import type { AxiosError } from 'axios';

import { getApiPath } from '@/shared/lib/api-config';
import { api } from '@/shared/lib/axios';
import type { ApiResponse } from '@/types/api';
import type { Role } from '../types';

export type GetRoleResponse = ApiResponse<Role>;

export async function getRole(roleId: string): Promise<GetRoleResponse | null> {
  try {
    const { data } = await api.get<ApiResponse<Role>>(getApiPath(`/roles/${roleId}`));
    return data;
  } catch (error: unknown) {
    if ((error as AxiosError)?.response?.status === 404) {
      return null;
    }
    throw error;
  }
}
