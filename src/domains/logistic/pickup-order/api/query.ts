import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import { getCompanyHeaders } from '../../api/shared';
import type { GetPickupOrdersParams, PickupOrderListResponse, PickupOrderResponse } from '../types';

export async function getPickupOrders(
  params?: GetPickupOrdersParams
): Promise<PickupOrderListResponse> {
  try {
    const { companyId, ...queryParams } = params ?? {};
    const { data } = await api.get<PickupOrderListResponse>(getApiPath('/logistic/pickup-orders'), {
      params: queryParams,
      headers: getCompanyHeaders(companyId),
    });
    return data;
  } catch (error: unknown) {
    return handleApiError(error, true);
  }
}

export async function getPickupOrderDetail(
  id: string,
  companyId?: string | null
): Promise<PickupOrderResponse> {
  try {
    const { data } = await api.get<PickupOrderResponse>(
      getApiPath(`/logistic/pickup-orders/${id}`),
      {
        headers: getCompanyHeaders(companyId),
      }
    );
    return data;
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
