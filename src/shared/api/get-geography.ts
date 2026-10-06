import type { SelectOption } from '@/components/atoms';
import { getApiPath } from '@/shared/lib/api-config';
import { api } from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/shared/types/api';

interface GeographyItem {
  id: string;
  name: string;
}

/** Provinces carry the workplace time zone; the other geography levels do not. */
export interface ProvinceItem extends GeographyItem {
  code?: string;
  timezone?: string | null;
  isActive?: boolean;
}

type GeographyResponse = ApiSuccessResponse<GeographyItem[]>;

type ProvinceResponse = ApiSuccessResponse<ProvinceItem[]>;

export function toSelectOptions(items: GeographyItem[]): SelectOption[] {
  return items.map((item) => ({ label: item.name, value: item.id }));
}

export const geographyApi = {
  // returns the raw rows so callers that need `timezone` can read it; `useProvinces`
  // still hands out plain options, so existing consumers are unaffected
  getProvinces: async (): Promise<ProvinceItem[]> => {
    const response = await api.get<ProvinceResponse>(getApiPath('/geography/provinces'));
    return response.data.data;
  },

  getCities: async (provinceId: string): Promise<SelectOption[]> => {
    const response = await api.get<GeographyResponse>(
      getApiPath(`/geography/provinces/${provinceId}/cities`)
    );
    return toSelectOptions(response.data.data);
  },

  getDistricts: async (cityId: string): Promise<SelectOption[]> => {
    const response = await api.get<GeographyResponse>(
      getApiPath(`/geography/cities/${cityId}/districts`)
    );
    return toSelectOptions(response.data.data);
  },

  getVillages: async (districtId: string): Promise<SelectOption[]> => {
    const response = await api.get<GeographyResponse>(
      getApiPath(`/geography/districts/${districtId}/villages`)
    );
    return toSelectOptions(response.data.data);
  },
};
