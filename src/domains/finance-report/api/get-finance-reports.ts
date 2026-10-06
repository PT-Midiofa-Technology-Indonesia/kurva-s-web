import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import { financeReportResponseSchema } from '../schemas';
import type { FinanceReportResponse, FinanceReportType } from '../types';

export interface GetFinanceReportsParams {
  companyId?: string;
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  source?: string;
  dateFrom?: string;
  dateTo?: string;
  type?: FinanceReportType;
}

export async function getFinanceReports(
  params?: GetFinanceReportsParams
): Promise<FinanceReportResponse> {
  try {
    const { companyId, ...queryParams } = params ?? {};
    const { data } = await api.get<FinanceReportResponse>(getApiPath('/finance/reports'), {
      params: queryParams,
      headers: companyId ? { 'X-Company-Id': companyId } : undefined,
    });
    return financeReportResponseSchema.parse(data);
  } catch (error: unknown) {
    return handleApiError(error, true) as unknown as FinanceReportResponse;
  }
}
