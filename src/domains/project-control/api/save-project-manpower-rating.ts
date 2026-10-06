import axios from '@/lib/axios';
import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import type { ApiSuccessResponse } from '@/types/api';
import type {
  ProjectManpowerRatingPayload,
  ProjectManpowerRatingRecord,
} from '../types/project-manpower-rating';

export async function saveProjectManpowerRating({
  projectId,
  employeeId,
  payload,
}: {
  projectId: string;
  employeeId: string;
  payload: ProjectManpowerRatingPayload;
}): Promise<ProjectManpowerRatingRecord> {
  try {
    const { data } = await axios.post<ApiSuccessResponse<ProjectManpowerRatingRecord>>(
      getApiPath(`/projects/${projectId}/manpower/${employeeId}/rating`),
      payload
    );

    return data.data;
  } catch (error) {
    return handleApiError(error);
  }
}
