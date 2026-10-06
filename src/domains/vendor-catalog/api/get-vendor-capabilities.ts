import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { BaseQueryParams } from '@/shared/types/query-params';
import type { ApiPaginatedResponse } from '@/types/api';
import type { VendorCapabilityListItem } from '../types';

export interface GetVendorCapabilitiesParams extends BaseQueryParams {
  vendorId?: string;
  isActive?: boolean;
}

export type GetVendorCapabilitiesResponse = ApiPaginatedResponse<VendorCapabilityListItem[]>;

export async function getVendorCapabilities(
  params?: GetVendorCapabilitiesParams
): Promise<GetVendorCapabilitiesResponse> {
  try {
    const { data } = await api.get<GetVendorCapabilitiesResponse>(
      getApiPath('/vendor-capabilities'),
      { params }
    );
    return data;
  } catch (error: unknown) {
    return handleApiError<VendorCapabilityListItem>(error, true);
  }
}
