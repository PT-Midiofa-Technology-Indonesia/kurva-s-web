import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { MarkProjectTaskDonePayload, ProjectTask } from '../types/manpower-planning';

export async function markProjectTaskDone(
  taskId: string,
  payload: MarkProjectTaskDonePayload,
  projectId?: string | null
): Promise<ProjectTask> {
  try {
    const formData = new FormData();
    if (payload.note) formData.append('note', payload.note);
    if (payload.qcDecision) formData.append('qcDecision', payload.qcDecision);
    payload.files?.forEach((file, index) => {
      formData.append(`files[${index}]`, file);
    });

    const { data } = await api.post<ApiSuccessResponse<ProjectTask>>(
      getApiPath(`/project-management/project-tasks/${taskId}/done`),
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(projectId ? { 'X-Project-Id': projectId } : {}),
        },
      }
    );
    return data.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
