import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { BaseQueryParams } from '@/shared/types/query-params';
import type { ApiPaginatedResponse } from '@/types/api';
import type { SkillLevelListItem } from '../types';

export interface GetSkillLevelsParams extends BaseQueryParams {
  isActive?: boolean;
}

export type GetSkillLevelsResponse = ApiPaginatedResponse<SkillLevelListItem[]>;

export async function getSkillLevels(
  params?: GetSkillLevelsParams
): Promise<GetSkillLevelsResponse> {
  try {
    const { data } = await api.get<ApiPaginatedResponse<SkillLevelListItem[]>>(
      getApiPath('/skill-levels'),
      { params }
    );
    return data;
  } catch (error: unknown) {
    return handleApiError<SkillLevelListItem>(error, true);
  }
}
