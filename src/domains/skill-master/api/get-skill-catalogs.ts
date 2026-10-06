import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { BaseQueryParams } from '@/shared/types/query-params';
import type { ApiPaginatedResponse } from '@/types/api';
import type { SkillCatalogListItem } from '../types';

export interface GetSkillCatalogsParams extends BaseQueryParams {
  isActive?: boolean;
  skillLevelId?: string;
  skillCategoryId?: string;
}

export type GetSkillCatalogsResponse = ApiPaginatedResponse<SkillCatalogListItem[]>;

export async function getSkillCatalogs(
  params?: GetSkillCatalogsParams
): Promise<GetSkillCatalogsResponse> {
  try {
    const { data } = await api.get<ApiPaginatedResponse<SkillCatalogListItem[]>>(
      getApiPath('/skill-catalogs'),
      { params }
    );
    return data;
  } catch (error: unknown) {
    return handleApiError<SkillCatalogListItem>(error, true);
  }
}
