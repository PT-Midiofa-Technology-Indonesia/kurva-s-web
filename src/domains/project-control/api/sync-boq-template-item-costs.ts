import axios from '@/lib/axios';
import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import type { ApiResponse } from '@/types/api';

export interface SyncBOQTemplateItemCostItemBase {
  id?: string | null;
  catalogId?: string;
  code?: string;
  name?: string;
  volumeRab?: number | null;
  volumeCco?: number | null;
  volumeActual?: number | null;
  uomId?: string | null;
  durationRab?: number | null;
  durationUomId?: string | null;
  durationCco?: number | null;
  durationActual?: number | null;
  unitPriceRab?: number | null;
  unitPriceCco?: number | null;
  unitPriceActual?: number | null;
}

export interface SyncBOQTemplateItemCostCategory {
  costCategory: string;
  items: SyncBOQTemplateItemCostItemBase[];
  deletedIds: string[];
}

export interface SyncBOQTemplateItemCostsPayload {
  categories: SyncBOQTemplateItemCostCategory[];
}

export async function syncBOQTemplateItemCosts(
  templateId: string,
  itemId: string,
  payload: SyncBOQTemplateItemCostsPayload
): Promise<ApiResponse<null>> {
  try {
    const response = await axios.post<ApiResponse<null>>(
      getApiPath(`/boq-templates/${templateId}/items/${itemId}/costs/sync`),
      payload
    );
    return response.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
