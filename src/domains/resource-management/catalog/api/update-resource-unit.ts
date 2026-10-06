import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { ResourceUnit, UpdateResourceUnitPayload } from '../types';

export async function updateResourceUnit(
  id: string,
  payload: UpdateResourceUnitPayload,
  companyId?: string
): Promise<ResourceUnit> {
  try {
    const { data } = await api.put<ApiSuccessResponse<ResourceUnit>>(
      getApiPath(`/resource-units/${id}`),
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
