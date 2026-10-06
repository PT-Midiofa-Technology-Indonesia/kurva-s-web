import { handleApiError } from '@/lib/api-error';
import { getApiPath } from '@/shared/lib/api-config';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { PermissionGroup } from '../types';

export interface GetPermissionGroupsParams {
  workspace?: string;
}

export async function getPermissionGroups(
  params?: GetPermissionGroupsParams
): Promise<PermissionGroup[]> {
  try {
    const { data } = await api.get<ApiSuccessResponse<PermissionGroup[]>>(
      getApiPath('/permissions'),
      { params }
    );
    return data.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
