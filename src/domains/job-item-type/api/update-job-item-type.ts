import { handleApiError } from '@/lib/api-error';
import { getApiPath } from '@/shared/lib/api-config';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { JobItemType } from '../types';

export interface UpdateJobItemTypePayload {
  code?: string;
  name?: string | null;
  description?: string | null;
  isActive?: boolean;
}

export async function updateJobItemType(
  id: string,
  payload: UpdateJobItemTypePayload
): Promise<JobItemType> {
  try {
    const { data } = await api.put<ApiSuccessResponse<JobItemType>>(
      getApiPath(`/job-item-types/${id}`),
      payload
    );
    return data.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
