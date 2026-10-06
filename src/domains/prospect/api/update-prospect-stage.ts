import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';

export interface UpdateProspectStagePayload {
  projectId: string;
  stage: string;
}

export async function updateProspectStage(
  { projectId, stage }: UpdateProspectStagePayload,
  companyId?: string
): Promise<void> {
  try {
    const headers = companyId ? { 'X-Company-Id': companyId } : undefined;
    await api.patch(getApiPath(`/projects/${projectId}/stage`), { stage }, { headers });
  } catch (error: unknown) {
    handleApiError(error);
  }
}
