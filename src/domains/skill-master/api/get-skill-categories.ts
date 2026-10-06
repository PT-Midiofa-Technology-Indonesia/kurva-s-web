import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { BaseQueryParams } from '@/shared/types/query-params';
import type { ApiPaginatedResponse } from '@/types/api';
import type { SkillCategoryListItem } from '../types';

export interface GetSkillCategoriesParams extends BaseQueryParams {
  isActive?: boolean;
}

export type GetSkillCategoriesResponse = ApiPaginatedResponse<SkillCategoryListItem[]>;

export async function getSkillCategories(
  params?: GetSkillCategoriesParams
): Promise<GetSkillCategoriesResponse> {
  try {
    const { data } = await api.get<GetSkillCategoriesResponse>(getApiPath('/skill-categories'), {
      params,
    });
    return data;
  } catch (error: unknown) {
    return handleApiError<SkillCategoryListItem>(error, true);
  }
}
