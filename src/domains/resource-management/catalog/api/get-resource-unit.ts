import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiResponse } from '@/types/api';
import type { ResourceUnit } from '../types';

export type GetResourceUnitResponse = ApiResponse<ResourceUnit>;

export async function getResourceUnit(
  id: string,
  companyId?: string
): Promise<GetResourceUnitResponse | null> {
  try {
    const { data } = await api.get<ApiResponse<ResourceUnit>>(getApiPath(`/resource-units/${id}`), {
      headers: companyId ? { 'X-Company-Id': companyId } : undefined,
    });
    return data;
  } catch (error: unknown) {
    if ((error as { response?: { status?: number } })?.response?.status === 404) {
      return null;
    }
    handleApiError(error);
  }
}
