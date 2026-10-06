import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/shared/types/api';
import type { PerformanceDetail } from '../types';

export interface GetPerformanceDetailResponse extends ApiSuccessResponse<PerformanceDetail> {}

export async function getPerformanceDetail(
  performanceId: string,
  companyId?: string
): Promise<PerformanceDetail> {
  try {
    const { data } = await api.get<GetPerformanceDetailResponse>(
      getApiPath(`/performance/${performanceId}`),
      { headers: { 'x-company-id': companyId ?? '' } }
    );
    return data.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
