import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { BaseQueryParams } from '@/shared/types/query-params';
import type { ApiSuccessResponse } from '@/types/api';
import type { AssetRegistrationRegisterableUnit } from '../types';

export interface GetRegisterableUnitsParams extends BaseQueryParams {
  companyId?: string;
  showAll?: boolean;
  warehouseId?: string;
}

export type GetRegisterableUnitsResponse = ApiSuccessResponse<AssetRegistrationRegisterableUnit[]>;

function toBooleanQueryParam(value?: boolean) {
  if (value === undefined) return undefined;
  return Number(value);
}

export async function getRegisterableUnits(
  params?: GetRegisterableUnitsParams
): Promise<GetRegisterableUnitsResponse> {
  try {
    const { companyId, showAll, ...rest } = params ?? {};
    const queryParams = params
      ? {
          ...rest,
          showAll: toBooleanQueryParam(showAll),
        }
      : undefined;

    const { data } = await api.get<GetRegisterableUnitsResponse>(
      getApiPath('/asset-registrations/registerable-units'),
      {
        params: queryParams,
        headers: companyId ? { 'X-Company-Id': companyId } : undefined,
      }
    );
    return data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
