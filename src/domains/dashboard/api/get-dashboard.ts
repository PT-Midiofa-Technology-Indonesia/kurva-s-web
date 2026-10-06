import { getApiPath } from '@/shared/lib/api-config';
import { ApiErrorClass, getStatusCode, handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import { createEmptyDashboardProjectOverview } from '../services/dashboard-overview-empty';
import type {
  DashboardFinanceRemaining,
  DashboardFinanceSummary,
  DashboardKpiSummary,
  DashboardProjectOverview,
  DashboardProjectProgress,
  DashboardProjectSummary,
  SCurvePeriodMode,
} from '../types';

interface DashboardRequestParams {
  companyId?: string;
  params?: Record<string, string | undefined>;
}

interface DashboardProjectOverviewRequestParams {
  projectId?: string;
  interval?: SCurvePeriodMode;
  startDate?: string;
  endDate?: string;
}

async function getDashboardData<T>(
  path: string,
  { companyId, params }: DashboardRequestParams = {}
): Promise<T> {
  try {
    const { data } = await api.get<ApiSuccessResponse<T>>(getApiPath(path), {
      headers: companyId ? { 'X-Company-Id': companyId } : undefined,
      params,
    });

    if (!data.success) {
      const errorData = data as {
        message: string;
        errorCode?: string;
        errors?: Record<string, string[]> | null;
      };

      throw new ApiErrorClass(
        errorData.message,
        undefined,
        errorData.errorCode ?? 'UNKNOWN',
        errorData.errors ?? undefined
      );
    }

    return data.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}

export function getDashboardProjectSummary(params: DashboardRequestParams) {
  return getDashboardData<DashboardProjectSummary>('/dashboard/project/summary', params);
}

export function getDashboardProjectProgress(params: DashboardRequestParams) {
  return getDashboardData<DashboardProjectProgress>('/dashboard/project/progress', params);
}

export function getDashboardFinanceSummary(params: DashboardRequestParams) {
  return getDashboardData<DashboardFinanceSummary>('/dashboard/finance/summary', params);
}

export function getDashboardFinanceRemaining(params: DashboardRequestParams) {
  return getDashboardData<DashboardFinanceRemaining>('/dashboard/finance/remaining', params);
}

export function getDashboardKpiSummary(params: DashboardRequestParams) {
  return getDashboardData<DashboardKpiSummary>('/dashboard/kpi/summary', params);
}

export async function getDashboardProjectOverview(
  params: DashboardProjectOverviewRequestParams
): Promise<DashboardProjectOverview> {
  try {
    return await getDashboardData<DashboardProjectOverview>('/dashboard/project/overview', {
      params: {
        projectId: params.projectId,
        interval: params.interval,
        startDate: params.startDate,
        endDate: params.endDate,
      },
    });
  } catch (error: unknown) {
    if (getStatusCode(error) === 404) {
      return createEmptyDashboardProjectOverview();
    }

    throw error;
  }
}
