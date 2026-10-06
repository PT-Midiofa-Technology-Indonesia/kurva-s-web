import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { BaseQueryParams } from '@/shared/types/query-params';
import type { ApiPaginatedResponse } from '@/types/api';
import { mapProspectFeeListItem } from '../services/mappers';
import type { FeeRow } from '../types';
import type { ProspectFeeListItemResponse } from '../types/api';

export interface GetProspectFeesParams extends BaseQueryParams {
  companyId?: string;
  sortBy?:
    | 'projectName'
    | 'companyName'
    | 'projectCapability'
    | 'estimatedValue'
    | 'calculatedFee'
    | 'note';
}

export type GetProspectFeesResponse = ApiPaginatedResponse<FeeRow[]>;

export async function getProspectFees(
  params?: GetProspectFeesParams
): Promise<GetProspectFeesResponse> {
  try {
    const companyId = params?.companyId;
    const queryParams = params ? { ...params } : undefined;

    if (queryParams) {
      delete queryParams.companyId;
    }

    const { data } = await api.get<ApiPaginatedResponse<ProspectFeeListItemResponse[]>>(
      getApiPath('/prospect-fees'),
      {
        params: queryParams,
        headers: companyId ? { 'X-Company-Id': companyId } : undefined,
      }
    );

    return {
      ...data,
      data: data.data.map(mapProspectFeeListItem),
    };
  } catch (error: unknown) {
    return handleApiError<FeeRow>(error, true);
  }
}
