import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { CreateResourceUnitPayload, ResourceUnit } from '../types';

export async function createResourceUnit(
  payload: CreateResourceUnitPayload,
  companyId?: string
): Promise<ResourceUnit> {
  try {
    const { data } = await api.post<ApiSuccessResponse<ResourceUnit>>(
      getApiPath('/resource-units'),
      payload,
      {
        headers: companyId ? { 'X-Company-Id': companyId } : undefined,
      }
    );
    return data.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
