import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { MomDetail } from '../types';
import type { MeetingApiResponse } from '../types/api';
import { mapMeetingToDetail } from './mappers';

export async function cancelMeeting(
  id: string,
  reason: string,
  companyId: string
): Promise<MomDetail> {
  try {
    const { data } = await api.post<ApiSuccessResponse<MeetingApiResponse>>(
      getApiPath(`/meetings/${id}/cancel`),
      { reason },
      { headers: { 'X-Company-Id': companyId } }
    );
    return mapMeetingToDetail(data.data);
  } catch (error: unknown) {
    handleApiError(error);
  }
}
