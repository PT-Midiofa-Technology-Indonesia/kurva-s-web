import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { BaseQueryParams } from '@/shared/types/query-params';
import type { ApiPaginatedResponse } from '@/types/api';
import type { DepartmentListItem } from '../types';

export interface GetDepartmentsParams extends BaseQueryParams {
  isActive?: boolean;
  companyId?: string;
}

export type GetDepartmentsResponse = ApiPaginatedResponse<DepartmentListItem[]>;

export async function getDepartments(
  params?: GetDepartmentsParams
): Promise<GetDepartmentsResponse> {
  try {
    const { data } = await api.get<ApiPaginatedResponse<DepartmentListItem[]>>(
      getApiPath('/departments'),
      { params }
    );
    return data;
  } catch (error: unknown) {
    return handleApiError<DepartmentListItem>(error, true);
  }
}
