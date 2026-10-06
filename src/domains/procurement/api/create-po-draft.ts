import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/shared/types/api';
import type { CreatePoDraftPayload, CreatePoDraftResponse } from '../types/api';

export async function createPoDraft(
  payload: CreatePoDraftPayload,
  companyId?: string
): Promise<CreatePoDraftResponse> {
  try {
    const { data } = await api.post<ApiSuccessResponse<CreatePoDraftResponse>>(
      getApiPath('/procurement/po-drafts'),
      payload,
      { headers: companyId ? { 'X-Company-Id': companyId } : undefined }
    );
    return data.data;
  } catch (error: unknown) {
    handleApiError(error);
    throw error;
  }
}
