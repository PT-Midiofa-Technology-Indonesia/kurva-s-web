import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { Uom } from '../types';

export interface UpdateUomPayload {
  code?: string;
  group?: string;
  name?: string | null;
  description?: string | null;
  isActive?: boolean;
}

export async function updateUom(id: string, payload: UpdateUomPayload): Promise<Uom> {
  try {
    const { data } = await api.put<ApiSuccessResponse<Uom>>(getApiPath(`/uoms/${id}`), payload);
    return data.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
