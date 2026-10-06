import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiPaginatedResponse } from '@/types/api';
import type { EmployeeRatingHistoryItem } from '../types';

export interface GetEmployeeRatingsParams {
  employeeId: string;
  sourceType?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  perPage?: number;
}

export type GetEmployeeRatingsResponse = ApiPaginatedResponse<EmployeeRatingHistoryItem[]>;

export async function getEmployeeRatings(
  params: GetEmployeeRatingsParams
): Promise<GetEmployeeRatingsResponse> {
  const { employeeId, sourceType, dateFrom, dateTo, page, perPage } = params;

  try {
    const { data } = await api.get<GetEmployeeRatingsResponse>(
      getApiPath(`/employees/${employeeId}/ratings`),
      {
        params: {
          sourceType,
          dateFrom,
          dateTo,
          page,
          perPage,
        },
      }
    );

    return data;
  } catch (error: unknown) {
    return handleApiError<EmployeeRatingHistoryItem>(error, true);
  }
}
