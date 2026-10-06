import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/shared/types/api';
import type { PoDraftProject } from '../types/api';

export type GetPoDraftProjectsResponse = ApiSuccessResponse<PoDraftProject[]>;

export async function getPoDraftProjects(
  companyId?: string,
  type?: 'materialTool' | 'serviceRental'
): Promise<PoDraftProject[]> {
  try {
    const params: Record<string, string> = {};
    if (type) params.type = type;

    const { data } = await api.get<GetPoDraftProjectsResponse>(
      getApiPath('/procurement/po-drafts/projects'),
      {
        headers: companyId ? { 'X-Company-Id': companyId } : undefined,
        params: Object.keys(params).length > 0 ? params : undefined,
      }
    );
    return data.data;
  } catch (error: unknown) {
    handleApiError(error);
    throw error; // unreachable but satisfies TS
  }
}
