import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { VendorCatalog } from '../types';

export interface CreateVendorCatalogPayload {
  groupId?: string | null;
  code?: string;
  name: string;
  isSubcontractor: boolean;
  isSupplier: boolean;
  isLogistic: boolean;
  npwp?: string;
  siupNumber?: string;
  phone: string;
  email?: string;
  provinceId: string;
  cityId: string;
  districtId: string;
  villageId: string;
  postalCode?: string;
  addressDetail?: string;
  contactPersonName?: string;
  contactPersonPhone?: string;
  contactPersonEmail?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountHolder?: string;
  notes?: string;
  isActive: boolean;
}

export async function createVendorCatalog(
  payload: CreateVendorCatalogPayload
): Promise<VendorCatalog> {
  try {
    const { data } = await api.post<ApiSuccessResponse<VendorCatalog>>(
      getApiPath('/vendors'),
      payload
    );
    return data.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
