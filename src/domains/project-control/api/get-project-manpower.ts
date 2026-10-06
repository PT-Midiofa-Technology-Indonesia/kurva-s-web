import axios from '@/lib/axios';
import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import type { ApiSuccessResponse } from '@/types/api';
import type { ProjectManpowerListItem } from '../types/project-manpower-rating';

export interface GetProjectManpowerParams {
  search?: string;
}

export async function getProjectManpower(
  projectId: string,
  params: GetProjectManpowerParams = {}
): Promise<ProjectManpowerListItem[]> {
  try {
    const { data } = await axios.get<ApiSuccessResponse<ProjectManpowerListItem[]>>(
      getApiPath(`/projects/${projectId}/manpower`),
      {
        params: {
          search: params.search || undefined,
        },
      }
    );

    return data.data;
  } catch (error) {
    return handleApiError(error);
  }
}
