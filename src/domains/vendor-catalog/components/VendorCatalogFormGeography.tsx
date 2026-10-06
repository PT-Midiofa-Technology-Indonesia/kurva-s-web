'use client';

import { useEffect, useRef } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import type { VendorFormInput } from '../types';

interface GeographyObserverProps {
  onProvinceChange: (id: string) => void;
  onCityChange: (id: string) => void;
  onDistrictChange: (id: string) => void;
}

export function GeographyObserver({
  onProvinceChange,
  onCityChange,
  onDistrictChange,
}: GeographyObserverProps) {
  const { control, setValue } = useFormContext<VendorFormInput>();
  const provinceId = useWatch({ control, name: 'provinceId' });
  const cityId = useWatch({ control, name: 'cityId' });
  const districtId = useWatch({ control, name: 'districtId' });

  const prevProvinceRef = useRef(provinceId);
  const prevCityRef = useRef(cityId);
  const prevDistrictRef = useRef(districtId);

  useEffect(() => {
    if (prevProvinceRef.current === provinceId) return;
    prevProvinceRef.current = provinceId;
    setValue('cityId', null as any);
    setValue('districtId', null as any);
    setValue('villageId', null as any);
    onProvinceChange(provinceId ?? '');
    onCityChange('');
    onDistrictChange('');
  }, [provinceId, setValue, onProvinceChange, onCityChange, onDistrictChange]);

  useEffect(() => {
    if (prevCityRef.current === cityId) return;
    prevCityRef.current = cityId;
    setValue('districtId', null as any);
    setValue('villageId', null as any);
    onCityChange(cityId ?? '');
    onDistrictChange('');
  }, [cityId, setValue, onCityChange, onDistrictChange]);

  useEffect(() => {
    if (prevDistrictRef.current === districtId) return;
    prevDistrictRef.current = districtId;
    setValue('villageId', null as any);
    onDistrictChange(districtId ?? '');
  }, [districtId, setValue, onDistrictChange]);

  return null;
}
