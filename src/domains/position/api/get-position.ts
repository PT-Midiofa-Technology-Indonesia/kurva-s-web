import { handleApiError } from '@/lib/api-error';
import { getApiPath } from '@/shared/lib/api-config';
import api from '@/shared/lib/axios';
import type { ApiResponse } from '@/types/api';
import type { Position } from '../types';

export type GetPositionResponse = ApiResponse<Position>;

export async function getPosition(id: string): Promise<GetPositionResponse | null> {
  try {
    const { data } = await api.get<ApiResponse<Position>>(getApiPath(`/positions/${id}`));
    return data;
  } catch (error: unknown) {
    if ((error as { response?: { status?: number } })?.response?.status === 404) {
      return null;
    }
    handleApiError(error);
  }
}
