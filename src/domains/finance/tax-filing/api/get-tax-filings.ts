import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiPaginatedResponse } from '@/shared/types/api';
import type { BaseQueryParams } from '@/shared/types/query-params';
import type { TaxFiling } from '../types';

export interface GetTaxFilingsParams extends BaseQueryParams {
  taxPeriod?: string;
  taxTypeId?: string;
  status?: string;
  companyId?: string;
}
export type GetTaxFilingsResponse = ApiPaginatedResponse<TaxFiling[]>;
export async function getTaxFilings(params?: GetTaxFilingsParams): Promise<GetTaxFilingsResponse> {
  try {
    const { companyId, ...queryParams } = params ?? {};
    const { data } = await api.get<GetTaxFilingsResponse>(getApiPath('/finance/tax-filings'), {
      params: queryParams,
      headers: companyId ? { 'X-Company-Id': companyId } : undefined,
    });
    return data;
  } catch (error: unknown) {
    return handleApiError<TaxFiling>(error, true);
  }
}
