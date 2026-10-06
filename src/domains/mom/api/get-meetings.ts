import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiPaginatedResponse, PaginationMeta } from '@/types/api';
import type { MomRow, MomStatus } from '../types';
import type { MeetingApiResponse } from '../types/api';
import { mapMeetingToRow } from './mappers';

export interface GetMeetingsParams {
  search?: string;
  status?: MomStatus;
  sortBy?: 'title' | 'startAt' | 'endAt' | 'location';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  perPage?: number;
  companyId: string;
}

export interface GetMeetingsResult {
  rows: MomRow[];
  meta: PaginationMeta;
}

export async function getMeetings({
  companyId,
  ...params
}: GetMeetingsParams): Promise<GetMeetingsResult> {
  try {
    const { data } = await api.get<ApiPaginatedResponse<MeetingApiResponse[]>>(
      getApiPath('/meetings'),
      {
        params,
        headers: { 'X-Company-Id': companyId },
      }
    );
    return {
      rows: data.data.map(mapMeetingToRow),
      meta: data.meta,
    };
  } catch (error: unknown) {
    handleApiError(error);
  }
}
