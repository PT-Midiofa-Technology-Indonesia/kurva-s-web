import { handleApiError } from '@/lib/api-error';
import { getApiPath } from '@/shared/lib/api-config';
import api from '@/shared/lib/axios';
import type { ApiResponse } from '@/types/api';
import type { ProjectCapability } from '../types';

export type GetProjectCapabilityResponse = ApiResponse<ProjectCapability>;

export async function getProjectCapability(
  id: string
): Promise<GetProjectCapabilityResponse | null> {
  try {
    const { data } = await api.get<ApiResponse<ProjectCapability>>(
      getApiPath(`/project-capabilities/${id}`)
    );
    return data;
  } catch (error: unknown) {
    if ((error as { response?: { status?: number } })?.response?.status === 404) {
      return null;
    }
    handleApiError(error);
  }
}
