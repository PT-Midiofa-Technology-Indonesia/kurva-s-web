import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import { createAssetRegistrationSchema } from '../schemas';
import type { AssetRegistrationDetail } from '../types';

export interface CreateAssetRegistrationPayload {
  resourceUnitId: string;
  assetCategoryId: string;
  depreciationStartDate: string;
  salvageValue?: number;
  bookValueAtRegister?: number | null;
  serialNumber?: string | null;
  notes?: string | null;
  confirm?: boolean;
}

export interface CreateAssetRegistrationParams {
  companyId: string;
  payload: CreateAssetRegistrationPayload;
}

export async function createAssetRegistration(
  params: CreateAssetRegistrationParams
): Promise<AssetRegistrationDetail> {
  const validated = createAssetRegistrationSchema.parse(params.payload);

  try {
    const { data } = await api.post<ApiSuccessResponse<AssetRegistrationDetail>>(
      getApiPath('/asset-registrations'),
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
