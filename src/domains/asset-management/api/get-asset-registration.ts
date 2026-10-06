import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { AssetRegistrationDetail } from '../types';

export type GetAssetRegistrationResponse = ApiSuccessResponse<AssetRegistrationDetail>;

export async function getAssetRegistration(
  id: string,
  companyId?: string | null
): Promise<GetAssetRegistrationResponse | null> {
  try {
    const { data } = await api.get<GetAssetRegistrationResponse>(
      getApiPath(`/asset-registrations/${id}`),
      {
        headers: companyId ? { 'X-Company-Id': companyId } : undefined,
      }
    );
    return data;
  } catch (error: unknown) {
    if ((error as { response?: { status?: number } })?.response?.status === 404) {
      return null;
    }
    handleApiError(error);
  }
}
