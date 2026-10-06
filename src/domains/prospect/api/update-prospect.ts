import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { ProspectProject } from '../types';

export interface UpdateProspectPayload {
  companyId: string;
  projectId: string;
  title: string;
  clientName: string;
  estimatedValue: number;
  projectStartDate: string;
  projectEndDate: string;
  description?: string;
  projectTypeId: string | null;
  projectCapabilityIds: string[];
}

export type UpdateProspectResponse = ApiSuccessResponse<ProspectProject>;

export async function updateProspect(payload: UpdateProspectPayload): Promise<ProspectProject> {
  try {
    const { companyId, projectId, ...data } = payload;
    const { data: response } = await api.put<UpdateProspectResponse>(
      getApiPath(`/projects/${projectId}`),
      data,
      {
        headers: {
          'X-Company-Id': companyId,
        },
      }
    );
    return response.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
