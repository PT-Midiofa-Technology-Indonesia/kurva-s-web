import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import { mapProspectFeeSetting } from '../services/mappers';
import type { SettingFeeRow } from '../types';
import type {
  ProspectFeeSettingListItemResponse,
  UpdateProspectFeeSettingStatusPayload,
} from '../types/api';

export async function updateProspectFeeSettingStatus(
  id: string,
  companyId: string,
  payload: UpdateProspectFeeSettingStatusPayload
): Promise<SettingFeeRow> {
  try {
    const { data } = await api.patch<ApiSuccessResponse<ProspectFeeSettingListItemResponse>>(
      getApiPath(`/prospect-fees/settings/${id}/status`),
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
