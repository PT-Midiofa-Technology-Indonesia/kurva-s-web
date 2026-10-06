import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { MomDetail } from '../types';
import type { MeetingApiResponse } from '../types/api';
import { mapMeetingToDetail } from './mappers';

export async function getMeeting(id: string, companyId: string): Promise<MomDetail> {
  try {
    const { data } = await api.get<ApiSuccessResponse<MeetingApiResponse>>(
      getApiPath(`/meetings/${id}`),
      { headers: { 'X-Company-Id': companyId } }
    );
    return mapMeetingToDetail(data.data);
  } catch (error: unknown) {
    handleApiError(error);
  }
}
