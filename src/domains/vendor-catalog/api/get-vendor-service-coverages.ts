import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { VendorServiceCoverageListItem } from '../types';

export interface GetVendorServiceCoveragesParams {
  vendorId?: string;
}

export interface GetVendorServiceCoveragesResponse {
  success: boolean;
  message: string;
  data: VendorServiceCoverageListItem[];
}

export async function getVendorServiceCoverages(
  params?: GetVendorServiceCoveragesParams
): Promise<GetVendorServiceCoveragesResponse> {
  try {
    const { data } = await api.get<GetVendorServiceCoveragesResponse>(
      getApiPath('/vendor-service-coverages'),
      { params }
    );
    return data;
  } catch (error: unknown) {
    return handleApiError<VendorServiceCoverageListItem>(error, true);
  }
}
