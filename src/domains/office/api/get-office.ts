import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { Office } from '../types';

export async function getOffice(id: string): Promise<Office> {
  try {
    const { data } = await api.get<ApiSuccessResponse<Office>>(getApiPath(`/offices/${id}`));
    return data.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
