import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { VendorServiceCoverage } from '../types';

export interface SyncVendorServiceCoveragesCoverage {
  provinceId: string;
  cityIds?: string[];
}

export interface SyncVendorServiceCoveragesPayload {
  vendorId: string;
  coverages: SyncVendorServiceCoveragesCoverage[];
}

export async function syncVendorServiceCoverages(
  payload: SyncVendorServiceCoveragesPayload
): Promise<VendorServiceCoverage[]> {
  try {
    const { data } = await api.post<ApiSuccessResponse<VendorServiceCoverage[]>>(
      getApiPath('/vendor-service-coverages/sync'),
      payload
    );
    return data.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
