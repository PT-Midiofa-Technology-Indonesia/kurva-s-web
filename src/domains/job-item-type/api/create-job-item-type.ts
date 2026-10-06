import { handleApiError } from '@/lib/api-error';
import { getApiPath } from '@/shared/lib/api-config';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { JobItemType } from '../types';

export interface CreateJobItemTypePayload {
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
}

export async function createJobItemType(payload: CreateJobItemTypePayload): Promise<JobItemType> {
  try {
    const { data } = await api.post<ApiSuccessResponse<JobItemType>>(
      getApiPath('/job-item-types'),
      payload
    );
    return data.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
