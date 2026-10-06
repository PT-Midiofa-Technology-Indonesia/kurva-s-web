import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiPaginatedResponse } from '@/shared/types/api';
import type { BillingClientRef, BillingCompanyRef, BillingProjectTypeRef } from '../types';

// ============================================================================
// Params
// ============================================================================

export interface GetProjectsParams {
  companyId?: string;
}

export interface ProjectOption {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  currentStage?: string;
  currentStageName?: string;
  estimatedValue?: number | null;
  totalValue?: number | null;
  company?: BillingCompanyRef | null;
  client?: BillingClientRef | null;
  projectType?: BillingProjectTypeRef | null;
  statusBoqPlanning?: boolean;
  statusBoqFinal?: boolean;
  statusBoqExecution?: boolean;
}

// ============================================================================
// Response
// ============================================================================

export type GetProjectsResponse = ApiPaginatedResponse<ProjectOption[]>;

// ============================================================================
// API Function
// ============================================================================

export async function getProjects(params?: GetProjectsParams): Promise<GetProjectsResponse> {
  try {
    const headers = params?.companyId ? { 'X-Company-Id': params.companyId } : undefined;

    const { data } = await api.get<GetProjectsResponse>(getApiPath('/projects'), { headers });

    return data;
  } catch (error: unknown) {
    return handleApiError<ProjectOption>(error, true);
  }
}
