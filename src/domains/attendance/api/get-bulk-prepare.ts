import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError, isAxiosError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { BulkAttendanceItem } from '../types';

export interface BulkPrepareResponse {
  data: BulkAttendanceItem[];
}

export async function getBulkPrepare(
  date: string,
  companyId?: string | null
): Promise<BulkPrepareResponse> {
  try {
    const headers = companyId ? { 'X-Company-Id': companyId } : undefined;
    const { data } = await api.get<ApiSuccessResponse<BulkAttendanceItem[]>>(
      getApiPath('/human-resource/attendances/bulk-prepare'),
      { params: { date }, headers }
    );
    return data;
  } catch (error: unknown) {
    if (isAxiosError(error) && error.response?.status === 404) {
      return { data: [] };
    }
    handleApiError(error);
    return { data: [] }; // unreachable
  }
}
