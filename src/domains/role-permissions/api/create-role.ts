import { handleApiError } from '@/lib/api-error';
import { getApiPath } from '@/shared/lib/api-config';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { Role } from '../types';

export interface CreateRolePayload {
  name: string;
  guard?: string;
  isActive: boolean;
  permissions: number[];
}

export async function createRole(payload: CreateRolePayload): Promise<Role> {
  try {
    const { data } = await api.post<ApiSuccessResponse<Role>>(getApiPath('/roles'), payload);
    return data.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
