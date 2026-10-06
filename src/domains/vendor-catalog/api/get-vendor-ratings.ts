import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiPaginatedResponse } from '@/types/api';
import type { VendorRatingHistoryItem } from '../types';

export interface GetVendorRatingsParams {
  vendorId: string;
  sourceType?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  perPage?: number;
}

export type GetVendorRatingsResponse = ApiPaginatedResponse<VendorRatingHistoryItem[]>;

export async function getVendorRatings(
  params: GetVendorRatingsParams
): Promise<GetVendorRatingsResponse> {
  const { vendorId, sourceType, dateFrom, dateTo, page, perPage } = params;

  try {
    const { data } = await api.get<GetVendorRatingsResponse>(
      getApiPath(`/vendors/${vendorId}/ratings`),
      {
        params: {
          sourceType,
          dateFrom,
          dateTo,
          page,
          perPage,
        },
      }
    );
    return data;
  } catch (error: unknown) {
    return handleApiError<VendorRatingHistoryItem>(error, true);
  }
}
