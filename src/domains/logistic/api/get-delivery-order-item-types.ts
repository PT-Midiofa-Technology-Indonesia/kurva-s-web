import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';

export interface DeliveryOrderItemType {
  id: string;
  code: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type GetDeliveryOrderItemTypesResponse = ApiSuccessResponse<DeliveryOrderItemType[]>;

export async function getDeliveryOrderItemTypes(): Promise<GetDeliveryOrderItemTypesResponse> {
  try {
    const { data } = await api.get<GetDeliveryOrderItemTypesResponse>(
      getApiPath('/logistic/delivery-orders/item-types')
    );
    return data;
  } catch (error: unknown) {
    return handleApiError(error, true) as unknown as GetDeliveryOrderItemTypesResponse;
  }
}
