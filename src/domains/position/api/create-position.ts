import { handleApiError } from '@/lib/api-error';
import { getApiPath } from '@/shared/lib/api-config';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { Position } from '../types';

export interface CreatePositionPayload {
  code: string;
  name: string;
  level: number;
  isActive: boolean;
  skillCatalogIds?: string[];
}

export async function createPosition(payload: CreatePositionPayload): Promise<Position> {
  try {
    const { data } = await api.post<ApiSuccessResponse<Position>>(
      getApiPath('/positions'),
      payload
    );
    return data.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
