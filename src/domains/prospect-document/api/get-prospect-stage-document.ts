import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { ProspectStageDocument } from '../types';

export type GetProspectStageDocumentResponse = ApiSuccessResponse<ProspectStageDocument>;

export async function getProspectStageDocument(stage: string): Promise<ProspectStageDocument> {
  try {
    const { data } = await api.get<GetProspectStageDocumentResponse>(
      getApiPath(`/prospect-stage-documents/${stage}`)
    );
    return data.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
