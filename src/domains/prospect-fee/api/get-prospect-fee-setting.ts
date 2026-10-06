import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import { mapProspectFeeSetting } from '../services/mappers';
import type { SettingFeeRow } from '../types';
import type { ProspectFeeSettingListItemResponse } from '../types/api';

export type GetProspectFeeSettingResponse = ApiSuccessResponse<SettingFeeRow>;

export async function getProspectFeeSetting(
  id: string,
  companyId?: string
): Promise<GetProspectFeeSettingResponse | null> {
  try {
    const { data } = await api.get<ApiSuccessResponse<ProspectFeeSettingListItemResponse>>(
      getApiPath(`/prospect-fees/settings/${id}`),
      {
        headers: companyId ? { 'X-Company-Id': companyId } : undefined,
      }
    );

    return {
      ...data,
      data: mapProspectFeeSetting(data.data),
    };
  } catch (error: unknown) {
    if ((error as { response?: { status?: number } })?.response?.status === 404) {
      return null;
    }

    handleApiError(error);
  }
}
