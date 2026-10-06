import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/shared/types/api';
import type { FinanceReportDetail } from '../types';

export interface GetFinanceReportDetailParams {
  id: string;
  companyId?: string;
}

export type GetFinanceReportDetailResponse = ApiSuccessResponse<FinanceReportDetail>;

export async function getFinanceReportDetail({
  id,
  companyId,
}: GetFinanceReportDetailParams): Promise<GetFinanceReportDetailResponse> {
  try {
    const headers = companyId ? { 'X-Company-Id': companyId } : undefined;
    const { data } = await api.get<GetFinanceReportDetailResponse>(
      getApiPath(`/finance/reports/${id}`),
      { headers }
    );

    return data;
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
