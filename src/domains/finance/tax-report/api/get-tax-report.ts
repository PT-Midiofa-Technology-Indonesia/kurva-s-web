import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiResponse } from '@/shared/types/api';
import type { TaxReport } from '../types';

export interface GetTaxReportParams {
  id: string;
  companyId?: string;
}

export async function getTaxReport({
  id,
  companyId,
}: GetTaxReportParams): Promise<ApiResponse<TaxReport>> {
  try {
    const { data } = await api.get<ApiResponse<TaxReport>>(
      getApiPath(`/finance/tax-report/${id}`),
      {
        headers: companyId ? { 'X-Company-Id': companyId } : undefined,
      }
    );
    return data;
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
