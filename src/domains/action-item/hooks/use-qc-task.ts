'use client';

import { useQuery } from '@tanstack/react-query';
import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import { mapQcTaskToReviewDetail } from '../api/mappers';
import type { QcReviewDetail } from '../types';
import type { MeetingTaskDetailApiResponse } from '../types/api';
import { QC_TASK_QUERY_KEYS } from './use-qc-tasks';

async function getQcTaskDetail(id: string, companyId: string): Promise<QcReviewDetail> {
  try {
    const { data } = await api.get<ApiSuccessResponse<MeetingTaskDetailApiResponse>>(
      getApiPath(`/meeting-tasks/${id}`),
      { headers: { 'X-Company-Id': companyId } }
    );
    return mapQcTaskToReviewDetail(data.data);
  } catch (error: unknown) {
    handleApiError(error);
  }
}

export function useQcTask(params: { id?: string; companyId?: string }) {
  return useQuery({
    queryKey: QC_TASK_QUERY_KEYS.detail(params.id ?? ''),
    queryFn: () => getQcTaskDetail(params.id!, params.companyId!),
    enabled: Boolean(params.id && params.companyId),
  });
}
