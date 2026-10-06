import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { CreateResourceAllocationPayload, ResourceAllocation } from '../types';

export async function createResourceAllocation(
  payload: CreateResourceAllocationPayload,
  projectId: string
): Promise<ResourceAllocation> {
  try {
    const { data } = await api.post<ApiSuccessResponse<ResourceAllocation>>(
      getApiPath('/resource-allocations'),
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
