import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { BaseQueryParams } from '@/shared/types/query-params';
import type { ApiPaginatedResponse } from '@/types/api';
import type { PositionListItem } from '../types';

export interface GetPositionsParams extends BaseQueryParams {
  isActive?: boolean;
  load?: string;
  projectId?: string;
}

export type GetPositionsResponse = ApiPaginatedResponse<PositionListItem[]>;

export async function getPositions(params?: GetPositionsParams): Promise<GetPositionsResponse> {
  try {
    const { data } = await api.get<ApiPaginatedResponse<PositionListItem[]>>(
      getApiPath('/positions'),
      { params }
    );
    return data;
  } catch (error: unknown) {
    return handleApiError<PositionListItem>(error, true);
  }
}
