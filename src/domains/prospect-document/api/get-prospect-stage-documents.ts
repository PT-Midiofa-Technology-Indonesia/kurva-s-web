import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { ProspectStageDocument } from '../types';

export type GetProspectStageDocumentsResponse = ApiSuccessResponse<ProspectStageDocument[]>;

export async function getProspectStageDocuments(): Promise<ProspectStageDocument[]> {
  try {
    const { data } = await api.get<GetProspectStageDocumentsResponse>(
      getApiPath('/prospect-stage-documents')
    );
    return data.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
