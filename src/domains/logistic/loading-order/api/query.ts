import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import { getCompanyHeaders } from '../../api/shared';
import type {
  GetLoadingOrdersParams,
  LoadingOrderListResponse,
  LoadingOrderResponse,
} from '../types';

export async function getLoadingOrders(
  params?: GetLoadingOrdersParams
): Promise<LoadingOrderListResponse> {
  try {
    const { companyId, ...queryParams } = params ?? {};
    const { data } = await api.get<LoadingOrderListResponse>(
      getApiPath('/logistic/loading-orders'),
      {
        params: queryParams,
        headers: getCompanyHeaders(companyId),
      }
    );
    return data;
  } catch (error: unknown) {
    return handleApiError(error, true);
  }
}

export async function getLoadingOrderDetail(
  id: string,
  companyId?: string | null
): Promise<LoadingOrderResponse> {
  try {
    const { data } = await api.get<LoadingOrderResponse>(
      getApiPath(`/logistic/loading-orders/${id}`),
      {
        headers: getCompanyHeaders(companyId),
      }
    );
    return data;
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
