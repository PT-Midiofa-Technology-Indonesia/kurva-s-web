import { getApiPath } from '@/shared/lib/api-config';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { OvertimeActiveEmployee } from '../types';

export async function getOvertimeEmployees(companyId: string): Promise<OvertimeActiveEmployee[]> {
  const { data } = await api.get<ApiSuccessResponse<OvertimeActiveEmployee[]>>(
    getApiPath('/human-resource/overtimes/employees'),
    { headers: { 'X-Company-Id': companyId } }
  );
  return data.data;
}
