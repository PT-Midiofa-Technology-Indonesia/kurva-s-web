import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/shared/types/api';
import { getCompanyHeaders } from '../../api/shared';
import type {
  CreateLoadingOrderPayload,
  LoadingOrderResponse,
  UpdateLoadingOrderPayload,
} from '../types';

export async function createLoadingOrder(
  payload: CreateLoadingOrderPayload,
  companyId?: string | null
): Promise<LoadingOrderResponse> {
  try {
    const { data } = await api.post<LoadingOrderResponse>(
      getApiPath('/logistic/loading-orders'),
      payload,
      { headers: getCompanyHeaders(companyId) }
    );
    return data;
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

export async function updateLoadingOrder(
  id: string,
  payload: UpdateLoadingOrderPayload,
  companyId?: string | null
): Promise<LoadingOrderResponse> {
  try {
    const { data } = await api.patch<LoadingOrderResponse>(
      getApiPath(`/logistic/loading-orders/${id}`),
      payload,
      { headers: getCompanyHeaders(companyId) }
    );
    return data;
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

export async function deleteLoadingOrder(
  id: string,
  companyId?: string | null
): Promise<ApiSuccessResponse<null>> {
  try {
    const { data } = await api.delete<ApiSuccessResponse<null>>(
      getApiPath(`/logistic/loading-orders/${id}`),
      { headers: getCompanyHeaders(companyId) }
    );
    return data;
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

async function changeLoadingOrderStatus(
  id: string,
  action: 'prepare' | 'load' | 'cancel',
  companyId?: string | null
): Promise<LoadingOrderResponse> {
  try {
    const { data } = await api.post<LoadingOrderResponse>(
      getApiPath(`/logistic/loading-orders/${id}/${action}`),
      undefined,
      { headers: getCompanyHeaders(companyId) }
    );
    return data;
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

export const prepareLoadingOrder = (id: string, companyId?: string | null) =>
  changeLoadingOrderStatus(id, 'prepare', companyId);

export const loadLoadingOrder = (id: string, companyId?: string | null) =>
  changeLoadingOrderStatus(id, 'load', companyId);

export const cancelLoadingOrder = (id: string, companyId?: string | null) =>
  changeLoadingOrderStatus(id, 'cancel', companyId);
