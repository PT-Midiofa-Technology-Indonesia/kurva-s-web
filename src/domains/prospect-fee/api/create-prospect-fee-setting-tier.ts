import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import { mapProspectFeeTier } from '../services/mappers';
import type { FeeRange } from '../types';
import type { CreateProspectFeeTierPayload, ProspectFeeSettingTierResponse } from '../types/api';

export async function createProspectFeeSettingTier(
  settingId: string,
  companyId: string,
  payload: CreateProspectFeeTierPayload
): Promise<FeeRange> {
  try {
    const { data } = await api.post<ApiSuccessResponse<ProspectFeeSettingTierResponse>>(
      getApiPath(`/prospect-fees/settings/${settingId}/tiers`),
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
