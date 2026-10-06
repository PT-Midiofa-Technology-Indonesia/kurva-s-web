import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { BaseQueryParams } from '@/shared/types/query-params';
import type { ApiPaginatedResponse } from '@/types/api';
import type { AssetRegistrationListItem, AssetRegistrationStatusFilter } from '../types';

export interface GetAssetRegistrationsParams extends BaseQueryParams {
  companyId?: string;
  status?: AssetRegistrationStatusFilter;
  categoryId?: string;
  warehouseId?: string;
}

export type GetAssetRegistrationsResponse = ApiPaginatedResponse<AssetRegistrationListItem[]>;

export async function getAssetRegistrations(
  params?: GetAssetRegistrationsParams
): Promise<GetAssetRegistrationsResponse> {
  try {
    const companyId = params?.companyId;
    const queryParams = params ? { ...params } : undefined;

    if (queryParams) {
      delete queryParams.companyId;
    }

    const { data } = await api.get<GetAssetRegistrationsResponse>(
      getApiPath('/asset-registrations'),
      {
        params: queryParams,
        headers: companyId ? { 'X-Company-Id': companyId } : undefined,
      }
    );

    return data;
  } catch (error: unknown) {
    return handleApiError<AssetRegistrationListItem>(error, true);
  }
}
