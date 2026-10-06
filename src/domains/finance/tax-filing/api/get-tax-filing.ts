import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/shared/types/api';
import type { TaxFiling } from '../types';

export interface GetTaxFilingParams {
  id: string;
  companyId?: string;
}
export type GetTaxFilingResponse = ApiSuccessResponse<TaxFiling>;
export async function getTaxFiling(params: GetTaxFilingParams): Promise<GetTaxFilingResponse> {
  try {
    const { data } = await api.get<GetTaxFilingResponse>(
      getApiPath(`/finance/tax-filings/${params.id}`),
      { headers: params.companyId ? { 'X-Company-Id': params.companyId } : undefined }
    );
    return data;
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
