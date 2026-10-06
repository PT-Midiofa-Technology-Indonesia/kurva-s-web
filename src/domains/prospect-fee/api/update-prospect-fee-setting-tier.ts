import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import { mapProspectFeeTier } from '../services/mappers';
import type { FeeRange } from '../types';
import type { ProspectFeeSettingTierResponse, UpdateProspectFeeTierPayload } from '../types/api';

export async function updateProspectFeeSettingTier(
  settingId: string,
  tierId: string,
  companyId: string,
  payload: UpdateProspectFeeTierPayload
): Promise<FeeRange> {
  try {
    const { data } = await api.put<ApiSuccessResponse<ProspectFeeSettingTierResponse>>(
      getApiPath(`/prospect-fees/settings/${settingId}/tiers/${tierId}`),
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
