import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiPaginatedResponse } from '@/shared/types/api';
import type { PayrollDraftSummary, PeriodeType } from '../types';

export interface GetPayrollDraftsParams {
  page?: number;
  perPage?: number;
  search?: string;
  sortBy?: PayrollDraftSortField;
  sortOrder?: 'asc' | 'desc';
  periodType?: PeriodeType;
  status?: string;
  periodStart?: string;
  periodEnd?: string;
}

export type PayrollDraftSortField =
  | 'code'
  | 'periodType'
  | 'periodStart'
  | 'periodEnd'
  | 'status'
  | 'totalAmount'
  | 'createdAt';

export async function getPayrollDrafts(
  params: GetPayrollDraftsParams & { companyId: string }
): Promise<ApiPaginatedResponse<PayrollDraftSummary[]>> {
  try {
    const response = await api.get<ApiPaginatedResponse<PayrollDraftSummary[]>>(
      getApiPath('/human-resource/payroll-drafts'),
      {
        params: {
          page: params.page ?? 1,
          perPage: params.perPage ?? 10,
          ...(params.search && { search: params.search }),
          ...(params.sortBy && {
            sortBy: params.sortBy,
            sortOrder: params.sortOrder ?? 'asc',
          }),
          ...(params.periodType && { periodType: params.periodType }),
          ...(params.status && { status: params.status }),
          ...(params.periodStart && { periodStart: params.periodStart }),
          ...(params.periodEnd && { periodEnd: params.periodEnd }),
        },
        headers: { 'X-Company-Id': params.companyId },
      }
    );
    return response.data;
  } catch (error) {
    return handleApiError<PayrollDraftSummary>(error, true);
  }
}
