import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { BaseQueryParams } from '@/shared/types/query-params';
import type { ApiPaginatedResponse } from '@/types/api';
import type { DeliveryOrder, DeliveryOrderType, RawDeliveryOrder } from '../types';
import { mapDeliveryOrder } from '../types';

export interface GetDeliveryOrdersParams extends BaseQueryParams {
  type: DeliveryOrderType;
  status?: string;
  sourceType?: string;
  etdAfter?: string;
  etdBefore?: string;
  destinationWarehouseId?: string;
  companyId?: string;
}

export type GetDeliveryOrdersResponse = ApiPaginatedResponse<DeliveryOrder[]>;

export async function getDeliveryOrders(
  params: GetDeliveryOrdersParams
): Promise<GetDeliveryOrdersResponse> {
  try {
    const { companyId, ...queryParams } = params;
    const { data } = await api.get<GetDeliveryOrdersResponse>(
      getApiPath('/logistic/delivery-orders'),
      {
        params: queryParams,
        headers: companyId ? { 'X-Company-Id': companyId } : undefined,
      }
    );
    return data;
  } catch (error: unknown) {
    return handleApiError<DeliveryOrder>(error, true);
  }
}

export async function getDeliveryOrderDetail(
  id: string,
  companyId?: string
): Promise<DeliveryOrder> {
  const { data } = await api.get<{ success: boolean; data: RawDeliveryOrder }>(
    getApiPath(`/logistic/delivery-orders/${id}`),
    {
      headers: companyId ? { 'X-Company-Id': companyId } : undefined,
    }
  );
  return mapDeliveryOrder(data.data);
}
