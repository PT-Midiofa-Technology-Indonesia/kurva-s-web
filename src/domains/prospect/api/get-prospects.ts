import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { ProspectStage } from '../types';

export interface GetProspectsParams {
  companyId: string;
}

export type GetProspectsResponse = ApiSuccessResponse<ProspectStage[]>;

export async function getProspects(params: GetProspectsParams): Promise<ProspectStage[]> {
  try {
    const { data } = await api.get<GetProspectsResponse>(getApiPath('/prospects'), {
      headers: { 'X-Company-Id': params.companyId },
    });
    return data.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
