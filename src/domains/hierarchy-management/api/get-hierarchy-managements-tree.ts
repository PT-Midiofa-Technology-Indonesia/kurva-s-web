import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiPaginatedResponse } from '@/types/api';
import type { CompanyPositionNode } from '../types';

export interface GetHierarchyManagementsTreeParams {
  companyId?: string;
  search?: string;
  isActive?: boolean;
  page?: number;
  perPage?: number;
}

export type GetHierarchyManagementsTreeResponse = ApiPaginatedResponse<CompanyPositionNode[]>;

export async function getHierarchyManagementsTree(
  params?: GetHierarchyManagementsTreeParams
): Promise<GetHierarchyManagementsTreeResponse> {
  try {
    const headers = params?.companyId ? { 'X-Company-Id': params.companyId } : undefined;
    const { data } = await api.get<GetHierarchyManagementsTreeResponse>(
      getApiPath('/company-positions/list'),
      { params: { ...params, load: 'child' }, headers }
    );
    return data;
  } catch (error: unknown) {
    return handleApiError<CompanyPositionNode>(error, true);
  }
}
