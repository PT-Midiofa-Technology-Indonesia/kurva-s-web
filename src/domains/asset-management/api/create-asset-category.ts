import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { AssetCategory } from '../types';

export interface CreateAssetCategoryPayload {
  code: string;
  name: string;
  usefulLifeMonths: number;
  depreciationMethod?: string;
  salvageValuePercent?: number;
  maintenanceIntervalMonths?: number | null;
  requiresSerial?: boolean;
  notes?: string | null;
  isActive?: boolean;
}

export async function createAssetCategory(
  payload: CreateAssetCategoryPayload
): Promise<AssetCategory> {
  try {
    const { data } = await api.post<ApiSuccessResponse<AssetCategory>>(
      getApiPath('/asset-categories'),
      payload
    );
    return data.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
