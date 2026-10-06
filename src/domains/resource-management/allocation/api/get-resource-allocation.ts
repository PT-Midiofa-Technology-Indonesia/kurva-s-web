import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiResponse } from '@/types/api';
import type { ResourceAllocation } from '../types';

export async function getResourceAllocation(
  id: string,
  projectId: string
): Promise<ApiResponse<ResourceAllocation> | null> {
  try {
    const { data } = await api.get<ApiResponse<ResourceAllocation>>(
      getApiPath(`/resource-allocations/${id}`),
      {
        headers: { 'X-Project-Id': projectId },
      }
    );
    return data;
  } catch (error: unknown) {
    if ((error as { response?: { status?: number } })?.response?.status === 404) {
      return null;
    }
    handleApiError(error);
  }
}
