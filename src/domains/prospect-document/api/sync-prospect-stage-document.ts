import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { ProspectStageDocument, SyncProspectStageDocumentPayload } from '../types';

export async function syncProspectStageDocument(
  stage: string,
  payload: SyncProspectStageDocumentPayload
): Promise<ProspectStageDocument> {
  try {
    const { data } = await api.post<ApiSuccessResponse<ProspectStageDocument>>(
      getApiPath(`/prospect-stage-documents/${stage}/sync`),
      payload
    );
    return data.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
