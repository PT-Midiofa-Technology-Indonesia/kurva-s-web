import { useQuery } from '@tanstack/react-query';
import { geographyApi, type ProvinceItem, toSelectOptions } from '@/shared/api/get-geography';

export const GEOGRAPHY_QUERY_KEY = {
  base: ['geography'] as const,
  provinces: () => [...GEOGRAPHY_QUERY_KEY.base, 'provinces'] as const,
  cities: (provinceId: string) => [...GEOGRAPHY_QUERY_KEY.base, 'cities', provinceId] as const,
  districts: (cityId: string) => [...GEOGRAPHY_QUERY_KEY.base, 'districts', cityId] as const,
  villages: (districtId: string) => [...GEOGRAPHY_QUERY_KEY.base, 'villages', districtId] as const,
};

export const useProvinces = () =>
  useQuery({
    queryKey: GEOGRAPHY_QUERY_KEY.provinces(),
    queryFn: geographyApi.getProvinces,
    select: toSelectOptions,
    staleTime: 1000 * 60 * 5,
  });

export const useProvinceTimezone = (provinceId?: string | null) =>
  useQuery({
    queryKey: GEOGRAPHY_QUERY_KEY.provinces(),
    queryFn: geographyApi.getProvinces,
    select: (items: ProvinceItem[]) =>
      items.find((item) => item.id === provinceId)?.timezone ?? null,
    enabled: !!provinceId,
    staleTime: 1000 * 60 * 5,
  }).data ?? null;

export const useCities = (provinceId?: string) =>
  useQuery({
    queryKey: GEOGRAPHY_QUERY_KEY.cities(provinceId ?? ''),
    queryFn: () => geographyApi.getCities(provinceId!),
    enabled: !!provinceId,
    staleTime: 1000 * 60 * 5,
  });

export const useDistricts = (cityId?: string) =>
  useQuery({
    queryKey: GEOGRAPHY_QUERY_KEY.districts(cityId ?? ''),
    queryFn: () => geographyApi.getDistricts(cityId!),
    enabled: !!cityId,
    staleTime: 1000 * 60 * 5,
  });

export const useVillages = (districtId?: string) =>
  useQuery({
    queryKey: GEOGRAPHY_QUERY_KEY.villages(districtId ?? ''),
    queryFn: () => geographyApi.getVillages(districtId!),
    enabled: !!districtId,
    staleTime: 1000 * 60 * 5,
  });
