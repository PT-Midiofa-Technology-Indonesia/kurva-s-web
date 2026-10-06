import axios from '@/lib/axios';
import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import type { ApiResponse } from '@/types/api';

export interface SyncBOQTemplateItem {
  id: string | null;
  projectCapabilityId?: string;
  name: string;
  isActive: boolean;
}

export interface SyncBOQTemplatesPayload {
  items: SyncBOQTemplateItem[];
  deletedIds: string[];
}

export async function syncBOQTemplates(
  payload: SyncBOQTemplatesPayload
): Promise<ApiResponse<null>> {
  try {
    const response = await axios.post<ApiResponse<null>>(
      getApiPath('/boq-templates/sync'),
      payload
    );
    return response.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
