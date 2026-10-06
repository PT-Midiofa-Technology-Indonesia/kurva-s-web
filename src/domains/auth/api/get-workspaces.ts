import { handleApiError } from '@/lib/api-error';
import { api } from '@/lib/axios';
import { API_ENDPOINTS } from '@/shared/constants';
import { getApiPath } from '@/shared/lib/api-config';
import type { ApiSuccessResponse } from '@/types/api';

import type { Workspace } from '../types';

export async function getWorkspaces(): Promise<Workspace[]> {
  try {
    const { data } = await api.get<ApiSuccessResponse<Workspace[]>>(
      getApiPath(API_ENDPOINTS.WORKSPACE.LIST)
    );
    return data.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
