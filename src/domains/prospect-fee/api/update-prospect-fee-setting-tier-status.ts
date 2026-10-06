import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import { mapProspectFeeTier } from '../services/mappers';
import type { FeeRange } from '../types';
import type {
  ProspectFeeSettingTierResponse,
  UpdateProspectFeeTierStatusPayload,
} from '../types/api';

export async function updateProspectFeeSettingTierStatus(
  settingId: string,
  tierId: string,
  companyId: string,
  payload: UpdateProspectFeeTierStatusPayload
): Promise<FeeRange> {
  try {
    const { data } = await api.patch<ApiSuccessResponse<ProspectFeeSettingTierResponse>>(
      getApiPath(`/prospect-fees/settings/${settingId}/tiers/${tierId}/status`),
      payload,
      {
        headers: { 'X-Company-Id': companyId },
      }
    );

    return mapProspectFeeTier(data.data);
  } catch (error: unknown) {
    handleApiError(error);
  }
}
