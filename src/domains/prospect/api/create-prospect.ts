import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { CreateProspectPayload, ProspectProject } from '../types';

export type CreateProspectResponse = ApiSuccessResponse<ProspectProject>;

export async function createProspect(payload: CreateProspectPayload): Promise<ProspectProject> {
  try {
    const { data } = await api.post<CreateProspectResponse>(getApiPath('/projects'), payload, {
      headers: {
        'X-Company-Id': payload.companyId,
      },
    });
    return data.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
