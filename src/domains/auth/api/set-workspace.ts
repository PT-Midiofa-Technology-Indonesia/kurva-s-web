import { handleApiError } from '@/lib/api-error';
import { api } from '@/lib/axios';
import { API_ENDPOINTS } from '@/shared/constants';
import { getApiPath } from '@/shared/lib/api-config';
import type { ApiSuccessResponse } from '@/types/api';

import type { Workspace } from '../types';

export interface SetWorkspacePayload {
  workspaceId: string;
}

export async function setWorkspace(payload: SetWorkspacePayload): Promise<Workspace> {
  try {
    const { data } = await api.post<ApiSuccessResponse<Workspace>>(
      getApiPath(API_ENDPOINTS.AUTH.SET_WORKSPACE),
      payload
    );
    return data.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
