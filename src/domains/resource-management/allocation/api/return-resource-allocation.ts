import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { ResourceAllocation } from '../types';

export async function returnResourceAllocation(
  id: string,
  projectId: string
): Promise<ResourceAllocation> {
  try {
    const { data } = await api.post<ApiSuccessResponse<ResourceAllocation>>(
      getApiPath(`/resource-allocations/${id}/return`),
      {},
      {
        headers: { 'X-Project-Id': projectId },
      }
    );
    return data.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
