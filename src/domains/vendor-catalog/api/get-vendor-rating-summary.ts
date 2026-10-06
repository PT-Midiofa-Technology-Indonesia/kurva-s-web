import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { VendorRatingSummary } from '../types';

export interface GetVendorRatingSummaryParams {
  vendorId: string;
  showAll?: boolean;
}

export type GetVendorRatingSummaryResponse = ApiSuccessResponse<VendorRatingSummary>;

export async function getVendorRatingSummary(
  params: GetVendorRatingSummaryParams
): Promise<GetVendorRatingSummaryResponse> {
  const { vendorId, showAll = false } = params;

  try {
    const { data } = await api.get<GetVendorRatingSummaryResponse>(
      getApiPath(`/vendors/${vendorId}/ratings/summary`),
      {
        params: {
          showAll,
        },
      }
    );
    return data;
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
