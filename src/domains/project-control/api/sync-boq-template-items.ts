import axios from '@/lib/axios';
import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import type { ApiResponse } from '@/types/api';

export interface SyncBOQTemplateItemPayload {
  id: string | null;
  tempId: string | null;
  parentId: string | null;
  parentTempId: string | null;
  sortOrder: number;
  name: string;
  jobItemTypeId: string;
  isFinalLevel: boolean;
  weight: number;
  isActive: boolean;
  suggestionItemId: string | null;
}

export interface SyncBOQTemplateItemsPayload {
  items: SyncBOQTemplateItemPayload[];
  deletedIds: string[];
}

export async function syncBOQTemplateItems(
  templateId: string,
  payload: SyncBOQTemplateItemsPayload
): Promise<ApiResponse<null>> {
  try {
    const response = await axios.post<ApiResponse<null>>(
      getApiPath(`/boq-templates/${templateId}/items/sync`),
      payload
    );
    return response.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
