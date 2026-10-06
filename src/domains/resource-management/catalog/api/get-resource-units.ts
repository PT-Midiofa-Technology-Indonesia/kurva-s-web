import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { BaseQueryParams } from '@/shared/types/query-params';
import type { ApiPaginatedResponse } from '@/types/api';
import type { ResourceUnitListItem } from '../types';

export interface GetResourceUnitsParams extends BaseQueryParams {
  warehouseId?: string;
  itemType?: string; // 'material' | 'equipment'
  status?: string; // 'available' | 'allocated' | 'maintenance' | 'retired'
  isAllocatable?: boolean;
}

export type GetResourceUnitsResponse = ApiPaginatedResponse<ResourceUnitListItem[]>;

export async function getResourceUnits(
  params?: GetResourceUnitsParams,
  companyId?: string
): Promise<GetResourceUnitsResponse> {
  const effectiveCompanyId = companyId ?? params?.companyId;
  try {
    const { data } = await api.get<ApiPaginatedResponse<ResourceUnitListItem[]>>(
      getApiPath('/resource-units'),
      {
        params,
        headers: effectiveCompanyId ? { 'X-Company-Id': effectiveCompanyId } : undefined,
      }
    );
    return data;
  } catch (error: unknown) {
    return handleApiError<ResourceUnitListItem>(error, true);
  }
}
