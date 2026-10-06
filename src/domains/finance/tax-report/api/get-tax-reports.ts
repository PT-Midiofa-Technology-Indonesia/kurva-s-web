import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiPaginatedResponse } from '@/shared/types/api';
import type { BaseQueryParams } from '@/shared/types/query-params';
import type { TaxReport } from '../types';

export interface GetTaxReportsParams extends BaseQueryParams {
  source?: string;
  taxTypeId?: string;
  status?: string;
  companyId?: string;
  startDate?: string;
  endDate?: string;
}

export type GetTaxReportsResponse = ApiPaginatedResponse<TaxReport[]>;

export async function getTaxReports(params?: GetTaxReportsParams): Promise<GetTaxReportsResponse> {
  try {
    const { companyId, ...queryParams } = params ?? {};
    const { data } = await api.get<GetTaxReportsResponse>(getApiPath('/finance/tax-report'), {
      params: queryParams,
      headers: companyId ? { 'X-Company-Id': companyId } : undefined,
    });
    return data;
  } catch (error: unknown) {
    return handleApiError<TaxReport>(error, true);
  }
}
