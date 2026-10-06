import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/shared/types/api';

export async function deleteVendorFromDraft(
  draftId: string,
  vendorId: string,
  companyId?: string
): Promise<void> {
  try {
    await api.delete<ApiSuccessResponse<void>>(
      getApiPath(`/procurement/po-drafts/${draftId}/vendors/${vendorId}`),
      {
        headers: companyId ? { 'X-Company-Id': companyId } : {},
      }
    );
  } catch (error: unknown) {
    handleApiError(error);
    throw error;
  }
}
