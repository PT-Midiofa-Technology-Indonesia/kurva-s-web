import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import { getCompanyHeaders, unwrapApiArrayResponse } from '../../api/shared';
import type {
  GetLoadingOrderPickersParams,
  LoadingOrderAvailableEquipment,
  LoadingOrderAvailableMaterial,
  LoadingOrderSelectableAllocation,
} from '../types';

export async function getLoadingOrderAvailableMaterials(
  warehouseId: string,
  params?: GetLoadingOrderPickersParams
): Promise<LoadingOrderAvailableMaterial[]> {
  try {
    const { data } = await api.get<
      LoadingOrderAvailableMaterial[] | { data: LoadingOrderAvailableMaterial[] }
    >(getApiPath(`/logistic/loading-orders/available-materials/${warehouseId}`), {
      params: params?.search ? { search: params.search } : undefined,
      headers: getCompanyHeaders(params?.companyId),
    });
    return unwrapApiArrayResponse<LoadingOrderAvailableMaterial>(data);
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

export async function getLoadingOrderAvailableEquipment(
  warehouseId: string,
  params?: GetLoadingOrderPickersParams
): Promise<LoadingOrderAvailableEquipment[]> {
  try {
    const { data } = await api.get<
      LoadingOrderAvailableEquipment[] | { data: LoadingOrderAvailableEquipment[] }
    >(getApiPath(`/logistic/loading-orders/available-equipment/${warehouseId}`), {
      params: params?.search ? { search: params.search } : undefined,
      headers: getCompanyHeaders(params?.companyId),
    });
    return unwrapApiArrayResponse<LoadingOrderAvailableEquipment>(data);
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

export async function getLoadingOrderSelectableAllocations(
  params?: GetLoadingOrderPickersParams
): Promise<LoadingOrderSelectableAllocation[]> {
  try {
    const { data } = await api.get<
      LoadingOrderSelectableAllocation[] | { data: LoadingOrderSelectableAllocation[] }
    >(getApiPath('/logistic/loading-orders/selectable-allocations'), {
      params:
        params?.search || params?.companyId
          ? {
              ...(params.search ? { search: params.search } : {}),
              ...(params.companyId ? { companyId: params.companyId } : {}),
            }
          : undefined,
      headers: getCompanyHeaders(params?.companyId),
    });
    return unwrapApiArrayResponse<LoadingOrderSelectableAllocation>(data);
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
