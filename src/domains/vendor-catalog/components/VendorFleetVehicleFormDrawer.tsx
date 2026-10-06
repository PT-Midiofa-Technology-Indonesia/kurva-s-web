'use client';

import { X } from 'lucide-react';
import { useMemo } from 'react';
import { Button } from '@/components/atoms';
import type { FormFieldConfig } from '@/components/organisms/FormGenerator';
import { FormGenerator } from '@/components/organisms/FormGenerator';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/shared/components/ui/drawer';
import { COMMON_LABELS } from '@/shared/constants';
import { VENDOR_CATALOG_LABELS } from '../constants';
import { vendorFleetVehicleSchema } from '../schemas';
import type { VendorFleetVehicle, VendorFleetVehicleFormInput } from '../types';

const VEHICLE_TYPE_OPTIONS = [
  { label: 'Truck', value: 'Truck' },
  { label: 'Pickup', value: 'Pickup' },
  { label: 'Box', value: 'Box' },
  { label: 'Container', value: 'Container' },
  { label: 'Tanker', value: 'Tanker' },
  { label: 'Dump', value: 'Dump' },
  { label: 'Trailer', value: 'Trailer' },
];

interface VendorFleetVehicleFormDrawerProps {
  open: boolean;
  onClose: () => void;
  vendorId: string;
  vendorName: string;
  editItem?: VendorFleetVehicle | null;
  detailData?: VendorFleetVehicle | null;
  onSave: (payload: {
    vendorId: string;
    name: string;
    code: string;
    vehicleType: string;
    plateNumber: string;
    brand?: string;
    model?: string;
    yearOfManufacture?: number;
    weightMax?: number;
    weightUomId?: string;
    volumeMax?: number;
    volumeUomId?: string;
    pricePerTripMin?: number;
    pricePerDistanceMin?: number;
    pricePerDistanceMax?: number;
    distanceValueMin?: number;
    distanceValueMax?: number;
    distanceUomId?: string;
    notes?: string;
    isActive: boolean;
  }) => void;
  isSaving?: boolean;
}

export function VendorFleetVehicleFormDrawer({
  open,
  onClose,
  vendorId,
  vendorName,
  editItem,
  detailData,
  onSave,
  isSaving,
}: VendorFleetVehicleFormDrawerProps) {
  const isEdit = !!editItem;
  const currentItem = detailData ?? editItem ?? null;

  const fields: FormFieldConfig<VendorFleetVehicleFormInput>[] = useMemo(
    () => [
      {
        type: 'custom',
        content: (
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-sm font-medium text-slate-900">{vendorName}</p>
          </div>
        ),
        colSpan: 12,
      },
      {
        name: 'code',
        label: VENDOR_CATALOG_LABELS.FLEET.DRAWER.FIELDS.CODE,
        type: 'text',
        placeholder: VENDOR_CATALOG_LABELS.FLEET.DRAWER.PLACEHOLDERS.CODE,
        required: true,
        colSpan: 12,
      },
      {
        name: 'name',
        label: VENDOR_CATALOG_LABELS.FLEET.DRAWER.FIELDS.NAME,
        type: 'text',
        placeholder: VENDOR_CATALOG_LABELS.FLEET.DRAWER.PLACEHOLDERS.NAME,
        required: true,
        colSpan: 12,
      },
      {
        name: 'vehicleType',
        label: VENDOR_CATALOG_LABELS.FLEET.DRAWER.FIELDS.VEHICLE_TYPE,
        type: 'select',
        isSearchable: true,
        isClearable: true,
        options: VEHICLE_TYPE_OPTIONS,
        placeholder: VENDOR_CATALOG_LABELS.FLEET.DRAWER.PLACEHOLDERS.VEHICLE_TYPE,
        required: true,
        colSpan: 12,
      },
      {
        name: 'plateNumber',
        label: VENDOR_CATALOG_LABELS.FLEET.DRAWER.FIELDS.PLATE_NUMBER,
        type: 'text',
        placeholder: VENDOR_CATALOG_LABELS.FLEET.DRAWER.PLACEHOLDERS.PLATE_NUMBER,
        required: true,
        colSpan: 12,
      },
      {
        name: 'isActive',
        label: VENDOR_CATALOG_LABELS.FLEET.DRAWER.FIELDS.STATUS,
        type: 'switch',
        stateActiveLabel: COMMON_LABELS.STATUS.ACTIVE,
        stateInactiveLabel: COMMON_LABELS.STATUS.INACTIVE,
        required: true,
        colSpan: 12,
      },
    ],
    [vendorName]
  );

  const handleSubmit = (data: VendorFleetVehicleFormInput) => {
    onSave({
      vendorId,
      name: data.name,
      code: data.code,
      vehicleType: data.vehicleType,
      plateNumber: data.plateNumber,
      isActive: data.isActive,
    });
  };

  const handleCancel = () => {
    onClose();
  };

  const title = isEdit
    ? VENDOR_CATALOG_LABELS.FLEET.DRAWER.EDIT_TITLE
    : VENDOR_CATALOG_LABELS.FLEET.DRAWER.ADD_TITLE;

  const defaultValues: VendorFleetVehicleFormInput = useMemo(
    () => ({
      name: currentItem?.name ?? '',
      code: currentItem?.code ?? '',
      vehicleType: currentItem?.vehicleType ?? '',
      plateNumber: currentItem?.plateNumber ?? '',
      isActive: currentItem?.isActive ?? true,
    }),
    [currentItem]
  );

  return (
    <Drawer open={open} onOpenChange={(v) => !v && handleCancel()} direction="right">
      <DrawerContent className="w-lg max-w-lg inset-y-0! right-0! left-auto! mt-0! rounded-l-xl! rounded-r-none! border-l! flex flex-col">
        <DrawerHeader className="pb-2">
          <div className="flex items-center justify-between">
            <DrawerTitle className="text-lg font-semibold text-[#0A0A0A]">{title}</DrawerTitle>
            <DrawerClose asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={handleCancel}
              >
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-4">
          <FormGenerator
            key={open ? `${editItem?.id ?? 'new'}-${detailData ? 'detail' : 'base'}` : 'closed'}
            id="vendor-fleet-vehicle-form"
            schema={vendorFleetVehicleSchema}
            fields={fields}
            onSubmit={handleSubmit}
            defaultValues={defaultValues}
            className="content-start"
          />
        </div>

        <DrawerFooter className="border-t px-4 py-4">
          <Button type="submit" form="vendor-fleet-vehicle-form" disabled={isSaving}>
            {isSaving
              ? VENDOR_CATALOG_LABELS.FLEET.DRAWER.BUTTONS.SAVING
              : VENDOR_CATALOG_LABELS.FLEET.DRAWER.BUTTONS.SAVE}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleCancel}
            disabled={isSaving}
          >
            {VENDOR_CATALOG_LABELS.FLEET.DRAWER.BUTTONS.CANCEL}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
