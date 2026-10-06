import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { ResourceAllocation, UpdateResourceAllocationPayload } from '../types';

export async function updateResourceAllocation(
  id: string,
  payload: UpdateResourceAllocationPayload,
  projectId: string
): Promise<ResourceAllocation> {
  try {
    const { data } = await api.put<ApiSuccessResponse<ResourceAllocation>>(
      getApiPath(`/resource-allocations/${id}`),
      payload,
      {
        headers: { 'X-Project-Id': projectId },
      }
    );
    return data.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
