import { getApiPath } from '@/shared/lib/api-config';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { OvertimeEmployeeProjectsData } from '../types';

export async function getOvertimeEmployeeProjects(
  employeeId: string,
  companyId: string
): Promise<OvertimeEmployeeProjectsData> {
  const { data } = await api.get<ApiSuccessResponse<OvertimeEmployeeProjectsData>>(
    getApiPath(`/human-resource/overtimes/employees/${employeeId}/projects`),
    { headers: { 'X-Company-Id': companyId } }
  );
  return data.data;
}
