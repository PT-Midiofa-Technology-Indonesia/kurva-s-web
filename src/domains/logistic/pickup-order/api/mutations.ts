import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import { getCompanyHeaders } from '../../api/shared';
import type {
  CancelPickupOrderPayload,
  ChangePickupOrderEmployeePayload,
  CompletePickupOrderPayload,
  CreatePickupOrderPayload,
  PickupOrderResponse,
} from '../types';

export async function createPickupOrder(
  payload: CreatePickupOrderPayload,
  companyId?: string | null
): Promise<PickupOrderResponse> {
  try {
    const { data } = await api.post<PickupOrderResponse>(
      getApiPath('/logistic/pickup-orders'),
      payload,
      { headers: getCompanyHeaders(companyId) }
    );
    return data;
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

export async function completePickupOrder(
  id: string,
  payload: CompletePickupOrderPayload,
  companyId?: string | null
): Promise<PickupOrderResponse> {
  try {
    const { data } = await api.post<PickupOrderResponse>(
      getApiPath(`/logistic/pickup-orders/${id}/complete`),
      payload,
      { headers: getCompanyHeaders(companyId) }
    );
    return data;
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

export async function cancelPickupOrder(
  id: string,
  payload: CancelPickupOrderPayload,
  companyId?: string | null
): Promise<PickupOrderResponse> {
  try {
    const { data } = await api.post<PickupOrderResponse>(
      getApiPath(`/logistic/pickup-orders/${id}/cancel`),
      payload,
      { headers: getCompanyHeaders(companyId) }
    );
    return data;
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

export async function changePickupOrderEmployee(
  id: string,
  payload: ChangePickupOrderEmployeePayload,
  companyId?: string | null
): Promise<PickupOrderResponse> {
  try {
    const { data } = await api.post<PickupOrderResponse>(
      getApiPath(`/logistic/pickup-orders/${id}/change-employee`),
      payload,
      { headers: getCompanyHeaders(companyId) }
    );
    return data;
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
