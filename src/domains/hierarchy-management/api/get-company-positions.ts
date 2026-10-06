import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { CompanyWithPositions } from '../types';

export interface GetCompanyPositionsParams {
  companyId?: string;
  search?: string;
  isActive?: boolean;
}

export type GetCompanyPositionsResponse = ApiSuccessResponse<CompanyWithPositions[]>;

export async function getCompanyPositions(
  params?: GetCompanyPositionsParams
): Promise<GetCompanyPositionsResponse> {
  try {
    const headers = params?.companyId ? { 'X-Company-Id': params.companyId } : undefined;
    const { data } = await api.get<GetCompanyPositionsResponse>(getApiPath('/company-positions'), {
      params,
      headers,
    });
    return data;
  } catch (error: unknown) {
    return handleApiError<CompanyWithPositions>(error, true);
  }
}
