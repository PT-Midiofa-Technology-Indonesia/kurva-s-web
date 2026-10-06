import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { BOQTemplateItem } from './get-boq-template';

export interface GetBOQTemplateItemsSuggestionsParams {
  search?: string;
  level?: number;
  boqTemplateId: string;
}

export async function getBOQTemplateItemsSuggestions(
  params: GetBOQTemplateItemsSuggestionsParams
): Promise<BOQTemplateItem[]> {
  try {
    const { data } = await api.get<ApiSuccessResponse<BOQTemplateItem[]>>(
      getApiPath('/boq-template-items/suggestions'),
      { params }
    );
    return data.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
