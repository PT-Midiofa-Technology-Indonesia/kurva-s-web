import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import { mapProspectFeeSetting } from '../services/mappers';
import type { SettingFeeRow } from '../types';
import type {
  CreateProspectFeeSettingPayload,
  ProspectFeeSettingListItemResponse,
} from '../types/api';

export async function createProspectFeeSetting(
  companyId: string,
  payload: CreateProspectFeeSettingPayload
): Promise<SettingFeeRow> {
  try {
    const { data } = await api.post<ApiSuccessResponse<ProspectFeeSettingListItemResponse>>(
      getApiPath('/prospect-fees/settings'),
      payload,
      {
        headers: { 'X-Company-Id': companyId },
      }
    );

    return mapProspectFeeSetting(data.data);
  } catch (error: unknown) {
    handleApiError(error);
  }
}
