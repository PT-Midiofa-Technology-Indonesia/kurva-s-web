import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { StageHistoryEntry } from '../types';

export type GetProjectStageHistoryResponse = ApiSuccessResponse<StageHistoryEntry[]>;

export async function getProjectStageHistory(projectId: string): Promise<StageHistoryEntry[]> {
  try {
    const { data } = await api.get<GetProjectStageHistoryResponse>(
      getApiPath(`/projects/${projectId}/stage-history`)
    );
    return data.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
