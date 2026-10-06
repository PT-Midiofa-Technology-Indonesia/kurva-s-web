import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import { updateAssetRegistrationNotesSchema } from '../schemas';
import type { AssetRegistrationDetail } from '../types';

export interface UpdateAssetRegistrationNotesPayload {
  notes?: string | null;
}

export interface UpdateAssetRegistrationNotesParams {
  companyId: string;
  payload: UpdateAssetRegistrationNotesPayload;
}

export async function updateAssetRegistrationNotes(
  id: string,
  params: UpdateAssetRegistrationNotesParams
): Promise<AssetRegistrationDetail> {
  const validated = updateAssetRegistrationNotesSchema.parse(params.payload);

  try {
    const { data } = await api.patch<ApiSuccessResponse<AssetRegistrationDetail>>(
      getApiPath(`/asset-registrations/${id}/notes`),
      validated,
      {
        headers: { 'X-Company-Id': params.companyId },
      }
    );
    return data.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
