import { handleApiError } from '@/lib/api-error';
import { getApiPath } from '@/shared/lib/api-config';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { Position } from '../types';

export interface UpdatePositionPayload {
  code?: string;
  name?: string | null;
  level?: number;
  isActive?: boolean;
  skillCatalogIds?: string[];
}

export async function updatePosition(
  id: string,
  payload: UpdatePositionPayload
): Promise<Position> {
  try {
    const { data } = await api.put<ApiSuccessResponse<Position>>(
      getApiPath(`/positions/${id}`),
      payload
    );
    return data.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
