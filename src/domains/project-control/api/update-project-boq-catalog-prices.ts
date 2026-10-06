import axios from '@/lib/axios';
import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import type { ApiResponse } from '@/types/api';

export interface BOQCatalogPriceCostPayload {
  originalPriceRab?: number;
  markupPercentageRab?: number;
  unitPriceRab?: number;
}

export interface BOQCatalogPriceItemPayload {
  catalogId: string;
  materialCost?: BOQCatalogPriceCostPayload;
  equipmentCost?: BOQCatalogPriceCostPayload;
  transportCost?: BOQCatalogPriceCostPayload;
}

export interface UpdateBOQCatalogPricesPayload {
  prices: BOQCatalogPriceItemPayload[];
}

export async function updateProjectBOQCatalogPrices(
  projectId: string,
  payload: UpdateBOQCatalogPricesPayload
): Promise<ApiResponse<null>> {
  try {
    const response = await axios.patch<ApiResponse<null>>(
      getApiPath(`/projects/${projectId}/boq/catalog-prices`),
      payload
    );
    return response.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
