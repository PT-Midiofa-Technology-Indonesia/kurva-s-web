import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { BaseQueryParams } from '@/shared/types/query-params';
import type { ApiPaginatedResponse } from '@/types/api';
import { mapProspectFeeSetting } from '../services/mappers';
import type { SettingFeeRow } from '../types';
import type { ProspectFeeSettingListItemResponse } from '../types/api';

export interface GetProspectFeeSettingsParams extends BaseQueryParams {
  companyId?: string;
  sortBy?: 'projectCapability' | 'companyName' | 'status' | 'isActive';
}

export type GetProspectFeeSettingsResponse = ApiPaginatedResponse<SettingFeeRow[]>;

export async function getProspectFeeSettings(
  params?: GetProspectFeeSettingsParams
): Promise<GetProspectFeeSettingsResponse> {
  try {
    const companyId = params?.companyId;
    const queryParams = params ? { ...params } : undefined;

    if (queryParams) {
      delete queryParams.companyId;
    }

    const { data } = await api.get<ApiPaginatedResponse<ProspectFeeSettingListItemResponse[]>>(
      getApiPath('/prospect-fees/settings'),
      {
        params: queryParams,
        headers: companyId ? { 'X-Company-Id': companyId } : undefined,
      }
    );

    return {
      ...data,
      data: data.data.map(mapProspectFeeSetting),
    };
  } catch (error: unknown) {
    return handleApiError<SettingFeeRow>(error, true);
  }
}
