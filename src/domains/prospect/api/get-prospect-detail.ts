import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { ProspectDetailResponseData } from '../types';

export type GetProspectDetailResponse = ApiSuccessResponse<ProspectDetailResponseData>;

export async function getProspectDetail(projectId: string): Promise<ProspectDetailResponseData> {
  try {
    const { data } = await api.get<GetProspectDetailResponse>(getApiPath(`/projects/${projectId}`));
    return data.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
