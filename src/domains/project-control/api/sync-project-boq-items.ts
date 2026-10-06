import axios from '@/lib/axios';
import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import type { ApiResponse } from '@/types/api';

export interface SyncProjectBOQItemPayload {
  id: string | null;
  tempId: string | null;
  parentId: string | null;
  parentTempId: string | null;
  sortOrder: number;
  name: string;
  jobItemTypeId: string;
  isFinalLevel: boolean;
  // weight opsional: BOQ Planning tidak mengirim weight (bobot readonly)
  weight?: number | null;
  limitBudgetPercentage: number | null;
  volumeRab: number | null;
  volumeCco: number | null;
  volumeActual: number | null;
  uomId: string | null;
  remarks: string | null;
  isActive: boolean;
  suggestionItemId: string | null;
}

export interface SyncProjectBOQItemsPayload {
  items: SyncProjectBOQItemPayload[];
  deletedIds: string[];
}

export async function syncProjectBOQItems(
  projectId: string,
  payload: SyncProjectBOQItemsPayload
): Promise<ApiResponse<null>> {
  try {
    const response = await axios.post<ApiResponse<null>>(
      getApiPath(`/projects/${projectId}/boq/items/sync`),
      payload
    );
    return response.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
