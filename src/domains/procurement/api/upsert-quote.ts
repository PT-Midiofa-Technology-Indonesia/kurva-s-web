import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/shared/types/api';
import type { UpsertQuotePayload } from '../types/api';

export async function upsertQuote(
  draftId: string,
  payload: UpsertQuotePayload,
  companyId?: string
): Promise<void> {
  try {
    await api.put<ApiSuccessResponse<void>>(
      getApiPath(`/procurement/po-drafts/${draftId}/quotes`),
      payload,
      { headers: companyId ? { 'X-Company-Id': companyId } : undefined }
    );
  } catch (error: unknown) {
    handleApiError(error);
    throw error;
  }
}
