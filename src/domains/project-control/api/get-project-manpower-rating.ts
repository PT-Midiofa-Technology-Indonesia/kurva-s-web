import axios from '@/lib/axios';
import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import type { ApiSuccessResponse } from '@/types/api';
import type { ProjectManpowerRatingEnvelope } from '../types/project-manpower-rating';

export async function getProjectManpowerRating(
  projectId: string,
  employeeId: string
): Promise<ProjectManpowerRatingEnvelope> {
  try {
    const { data } = await axios.get<ApiSuccessResponse<ProjectManpowerRatingEnvelope>>(
      getApiPath(`/projects/${projectId}/manpower/${employeeId}/rating`)
    );

    return data.data;
  } catch (error) {
    return handleApiError(error);
  }
}
