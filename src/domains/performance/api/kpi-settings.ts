import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type {
  EmployeeGradeDetailSetting,
  EmployeeGradeDetailSettings,
  GetCompanySettingsResponse,
  GetEmployeeGradeDetailSettingsResponse,
  GetEmployeeGradesResponse,
  KPIAction,
  KPICompanySettingsPayload,
  KPIPillarComponent,
  SaveGradeActionsPayload,
  SavePillarComponentsPayload,
} from '../types';

export interface KPISettingsCompanyParams {
  companyId?: string | null;
}

export interface GetEmployeeGradesParams extends KPISettingsCompanyParams {
  page?: number;
  perPage?: number;
  search?: string;
}

function companyHeaders(companyId?: string | null) {
  return { 'x-company-id': companyId ?? '' };
}

export async function getCompanySettings(
  params: KPISettingsCompanyParams
): Promise<GetCompanySettingsResponse> {
  try {
    const { data } = await api.get<GetCompanySettingsResponse>(
      getApiPath('/performance/company-settings'),
      { headers: companyHeaders(params.companyId) }
    );
    return data;
  } catch (error: unknown) {
    return handleApiError(error, true) as unknown as GetCompanySettingsResponse;
  }
}

export async function updateCompanySettings(
  payload: KPICompanySettingsPayload & KPISettingsCompanyParams
): Promise<GetCompanySettingsResponse> {
  try {
    const { companyId, ...body } = payload;
    const { data } = await api.put<GetCompanySettingsResponse>(
      getApiPath('/performance/company-settings'),
      body,
      { headers: companyHeaders(companyId) }
    );
    return data;
  } catch (error: unknown) {
    return handleApiError(error, true) as unknown as GetCompanySettingsResponse;
  }
}

export async function getEmployeeGrades(
  params: GetEmployeeGradesParams
): Promise<GetEmployeeGradesResponse> {
  try {
    const { companyId, ...queryParams } = params;
    const { data } = await api.get<GetEmployeeGradesResponse>(
      getApiPath('/performance/employee-grades'),
      { params: queryParams, headers: companyHeaders(companyId) }
    );
    return data;
  } catch (error: unknown) {
    return handleApiError(error, true) as unknown as GetEmployeeGradesResponse;
  }
}

export async function getEmployeeGradeSettings(
  gradeId: string,
  params: KPISettingsCompanyParams
): Promise<GetEmployeeGradeDetailSettingsResponse> {
  try {
    const { data } = await api.get<GetEmployeeGradeDetailSettingsResponse>(
      getApiPath(`/performance/employee-grades/${gradeId}/settings`),
      { headers: companyHeaders(params.companyId) }
    );
    return data;
  } catch (error: unknown) {
    return handleApiError(error, true) as unknown as GetEmployeeGradeDetailSettingsResponse;
  }
}

export async function getPerformanceGrades(
  params: KPISettingsCompanyParams
): Promise<{ data: EmployeeGradeDetailSetting[] }> {
  try {
    const { data } = await api.get<{ data: EmployeeGradeDetailSetting[] }>(
      getApiPath('/performance/grades'),
      { headers: companyHeaders(params.companyId) }
    );
    return data;
  } catch (error: unknown) {
    return handleApiError(error, true) as unknown as { data: EmployeeGradeDetailSetting[] };
  }
}

export async function getPerformanceActions(
  type: 'reward' | 'punishment',
  params: KPISettingsCompanyParams
): Promise<{ data: KPIAction[] }> {
  try {
    const { data } = await api.get<{ data: KPIAction[] }>(getApiPath('/performance/actions'), {
      params: { type },
      headers: companyHeaders(params.companyId),
    });
    return data;
  } catch (error: unknown) {
    return handleApiError(error, true) as unknown as { data: KPIAction[] };
  }
}

export async function getPillarComponents(
  pillarId: string,
  params: KPISettingsCompanyParams
): Promise<{ data: KPIPillarComponent[] }> {
  try {
    const { data } = await api.get<{ data: KPIPillarComponent[] }>(
      getApiPath(`/performance/pillars/${pillarId}/components`),
      { headers: companyHeaders(params.companyId) }
    );
    return data;
  } catch (error: unknown) {
    return handleApiError(error, true) as unknown as { data: KPIPillarComponent[] };
  }
}

export async function saveGradeActions(
  gradeId: string,
  payload: SaveGradeActionsPayload & KPISettingsCompanyParams
): Promise<{ data: EmployeeGradeDetailSettings }> {
  try {
    const { companyId, ...body } = payload;
    const { data } = await api.post<{ data: EmployeeGradeDetailSettings }>(
      getApiPath(`/performance/employee-grades/${gradeId}/grade-actions`),
      body,
      { headers: companyHeaders(companyId) }
    );
    return data;
  } catch (error: unknown) {
    return handleApiError(error, true) as unknown as { data: EmployeeGradeDetailSettings };
  }
}

export async function savePillarComponents(
  gradeId: string,
  payload: SavePillarComponentsPayload & KPISettingsCompanyParams
): Promise<{ data: EmployeeGradeDetailSettings }> {
  try {
    const { companyId, ...body } = payload;
    const { data } = await api.post<{ data: EmployeeGradeDetailSettings }>(
      getApiPath(`/performance/employee-grades/${gradeId}/pillar-components`),
      body,
      { headers: companyHeaders(companyId) }
    );
    return data;
  } catch (error: unknown) {
    return handleApiError(error, true) as unknown as { data: EmployeeGradeDetailSettings };
  }
}

export async function deleteGradeAction(
  gradeId: string,
  actionId: string,
  params: KPISettingsCompanyParams
): Promise<void> {
  try {
    await api.delete(
      getApiPath(`/performance/employee-grades/${gradeId}/grade-actions/${actionId}`),
      {
        headers: companyHeaders(params.companyId),
      }
    );
  } catch (error: unknown) {
    handleApiError(error, true);
  }
}
