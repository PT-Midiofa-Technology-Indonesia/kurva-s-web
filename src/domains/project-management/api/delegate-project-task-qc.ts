import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { DelegateProjectTasksQcPayload, ProjectTask } from '../types/manpower-planning';

export async function delegateProjectTaskQc(
  payload: DelegateProjectTasksQcPayload,
  projectId?: string | null
): Promise<ProjectTask> {
  try {
    const { data } = await api.post<ApiSuccessResponse<ProjectTask>>(
      getApiPath('/project-management/project-tasks/delegate-qc'),
      payload,
      { headers: projectId ? { 'X-Project-Id': projectId } : undefined }
    );
    return data.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
