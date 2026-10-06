import axios from '@/lib/axios';
import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import type { ApiResponse } from '@/types/api';

export interface SyncProjectBOQCostItemBase {
  id?: string | null;
  catalogId?: string;
  code?: string;
  name?: string;
  volumeRab?: number | null;
  volumeCco?: number | null;
  volumeActual?: number | null;
  uomId?: string | null;
  durationRab?: number | null;
  durationCco?: number | null;
  durationActual?: number | null;
  durationUomId?: string | null;
  unitPriceRab?: number | null;
  unitPriceCco?: number | null;
  unitPriceActual?: number | null;
  remarks?: string | null;
}

export interface SyncProjectBOQCostCategory {
  costCategory: string;
  items: SyncProjectBOQCostItemBase[];
  deletedIds: string[];
}

export interface SyncProjectBOQItemCostsPayload {
  categories: SyncProjectBOQCostCategory[];
}

export async function syncProjectBOQItemCosts(
  projectId: string,
  itemId: string,
  payload: SyncProjectBOQItemCostsPayload
): Promise<ApiResponse<null>> {
  try {
    const response = await axios.post<ApiResponse<null>>(
      getApiPath(`/projects/${projectId}/boq/items/${itemId}/costs/sync`),
      payload
    );
    return response.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
