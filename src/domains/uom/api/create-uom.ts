import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { Uom } from '../types';

export interface CreateUomPayload {
  code: string;
  group: string;
  name: string;
  description?: string;
  isActive: boolean;
}

export async function createUom(payload: CreateUomPayload): Promise<Uom> {
  try {
    const { data } = await api.post<ApiSuccessResponse<Uom>>(getApiPath('/uoms'), payload);
    return data.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
