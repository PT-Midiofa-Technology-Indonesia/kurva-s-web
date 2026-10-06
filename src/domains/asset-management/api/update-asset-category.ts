import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { AssetCategory } from '../types';

export interface UpdateAssetCategoryPayload {
  name?: string;
  usefulLifeMonths?: number;
  depreciationMethod?: string;
  salvageValuePercent?: number;
  maintenanceIntervalMonths?: number | null;
  requiresSerial?: boolean;
  notes?: string | null;
  isActive?: boolean;
}

export async function updateAssetCategory(
  id: string,
  payload: UpdateAssetCategoryPayload
): Promise<AssetCategory> {
  try {
    const { data } = await api.put<ApiSuccessResponse<AssetCategory>>(
      getApiPath(`/asset-categories/${id}`),
      payload
    );
    return data.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
