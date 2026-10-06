import axios from '@/lib/axios';
import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import type { ApiPaginatedResponse } from '@/types/api';

export type BOQStage = 'planning' | 'final' | 'execution';
export type BOQStatusFilter = 'complete' | 'incomplete';

export interface BOQProjectCompany {
  id: string;
  name: string;
}

export interface BOQProjectClient {
  id: string;
  name: string;
}

export interface BOQProject {
  id: string;
  code: string;
  name: string;
  description: string;
  estimatedValue: number;
  totalValue: number;
  projectStartDate: string;
  projectEndDate: string;
  isRabComplete: boolean;
  isLimitBudgetComplete: boolean;
  isCcoComplete: boolean;
  statusBoqPlanning: boolean;
  statusBoqFinal: boolean;
  statusBoqExecution: boolean;
  company: BOQProjectCompany;
  client: BOQProjectClient;
}

export interface GetBOQProjectsParams {
  boqStage: BOQStage;
  companyId?: string;
  statusBoqPlanning?: boolean;
  statusBoqFinal?: boolean;
  statusBoqExecution?: boolean;
  page?: number;
  perPage?: number;
  search?: string;
}

export async function getBOQProjects(
  params: GetBOQProjectsParams
): Promise<ApiPaginatedResponse<BOQProject>> {
  try {
    const headers = params.companyId ? { 'X-Company-Id': params.companyId } : undefined;
    const response = await axios.get<ApiPaginatedResponse<BOQProject>>(getApiPath('/projects'), {
      params,
      headers,
    });
    return response.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
