import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { Group } from '../types';

export async function getGroup(id: string): Promise<Group> {
  try {
    const { data } = await api.get<ApiSuccessResponse<Group>>(getApiPath(`/groups/${id}`));
    return data.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
