import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import { getCompanyHeaders, unwrapApiArrayResponse } from '../../api/shared';
import type {
  GetPickupOrderPickersParams,
  PickupOrderEmployee,
  PickupOrderSelectableDeliveryOrder,
} from '../types';

export async function getPickupOrderAvailableEmployees(
  warehouseId: string,
  params?: GetPickupOrderPickersParams
): Promise<PickupOrderEmployee[]> {
  try {
    const { data } = await api.get<PickupOrderEmployee[] | { data: PickupOrderEmployee[] }>(
      getApiPath(`/logistic/pickup-orders/available-employees/${warehouseId}`),
      {
        params: params?.search ? { search: params.search } : undefined,
        headers: getCompanyHeaders(params?.companyId),
      }
    );
    return unwrapApiArrayResponse<PickupOrderEmployee>(data);
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

export async function getPickupOrderSelectableDeliveryOrders(
  params?: GetPickupOrderPickersParams
): Promise<PickupOrderSelectableDeliveryOrder[]> {
  try {
    const { data } = await api.get<
      PickupOrderSelectableDeliveryOrder[] | { data: PickupOrderSelectableDeliveryOrder[] }
    >(getApiPath('/logistic/pickup-orders/selectable-delivery-orders'), {
      params: params?.search ? { search: params.search } : undefined,
      headers: getCompanyHeaders(params?.companyId),
    });
    return unwrapApiArrayResponse<PickupOrderSelectableDeliveryOrder>(data);
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
