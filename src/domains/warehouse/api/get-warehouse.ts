import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { Warehouse } from '../types';

export async function getWarehouse(id: string): Promise<Warehouse> {
  try {
    const { data } = await api.get<ApiSuccessResponse<Warehouse>>(getApiPath(`/warehouses/${id}`));
    return data.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
