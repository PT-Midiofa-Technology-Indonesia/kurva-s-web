import { handleApiError } from '@/lib/api-error';
import { getApiPath } from '@/shared/lib/api-config';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { Role } from '../types';
import type { CreateRolePayload } from './create-role';

export async function updateRole(roleId: string, payload: CreateRolePayload): Promise<Role> {
  try {
    const { data } = await api.put<ApiSuccessResponse<Role>>(
      getApiPath(`/roles/${roleId}`),
      payload
    );
    return data.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
