import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/shared/types/api';
import type { PoDraftDetail } from '../types/api';

export async function getPoDraftDetail(
  draftId: string,
  companyId?: string
): Promise<PoDraftDetail> {
  try {
    const { data } = await api.get<ApiSuccessResponse<PoDraftDetail>>(
      getApiPath(`/procurement/po-drafts/${draftId}`),
      { headers: companyId ? { 'X-Company-Id': companyId } : undefined }
    );
    return data.data;
  } catch (error: unknown) {
    handleApiError(error);
    throw error;
  }
}
