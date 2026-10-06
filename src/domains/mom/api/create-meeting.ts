import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { MomDetail } from '../types';
import type { MeetingApiResponse, MeetingPayload } from '../types/api';
import { mapMeetingToDetail } from './mappers';

export async function createMeeting(
  payload: MeetingPayload,
  companyId: string
): Promise<MomDetail> {
  try {
    const { data } = await api.post<ApiSuccessResponse<MeetingApiResponse>>(
      getApiPath('/meetings'),
      payload,
      { headers: { 'X-Company-Id': companyId } }
    );
    return mapMeetingToDetail(data.data);
  } catch (error: unknown) {
    handleApiError(error);
  }
}
