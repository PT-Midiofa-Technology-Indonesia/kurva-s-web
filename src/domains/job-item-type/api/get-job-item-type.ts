import { handleApiError } from '@/lib/api-error';
import { getApiPath } from '@/shared/lib/api-config';
import api from '@/shared/lib/axios';
import type { ApiResponse } from '@/types/api';
import type { JobItemType } from '../types';

export type GetJobItemTypeResponse = ApiResponse<JobItemType>;

export async function getJobItemType(id: string): Promise<GetJobItemTypeResponse | null> {
  try {
    const { data } = await api.get<ApiResponse<JobItemType>>(getApiPath(`/job-item-types/${id}`));
    return data;
  } catch (error: unknown) {
    if ((error as { response?: { status?: number } })?.response?.status === 404) {
      return null;
    }
    handleApiError(error);
  }
}
