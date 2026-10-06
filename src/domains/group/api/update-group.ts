import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { Group } from '../types';

export interface UpdateGroupPayload {
  code?: string;
  name?: string | null;
  description?: string | null;
  isActive?: boolean;
}

export async function updateGroup(id: string, payload: UpdateGroupPayload): Promise<Group> {
  try {
    const { data } = await api.put<ApiSuccessResponse<Group>>(getApiPath(`/groups/${id}`), payload);
    return data.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
