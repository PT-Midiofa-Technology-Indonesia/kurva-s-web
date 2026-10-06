import { z } from 'zod';
import {
  addressBaseShape,
  codeRequiredSchema,
  isActiveSchema,
  nameRequiredSchema,
  optionalStringSchema,
  requiredSelectSchema,
} from '@/shared/schemas/common';

export const createVendorSchema = z
  .object({
    code: codeRequiredSchema,
    name: nameRequiredSchema,
    isSubcontractor: z.boolean(),
    isSupplier: z.boolean(),
    isLogistic: z.boolean(),
    isActive: isActiveSchema,
    npwp: optionalStringSchema,
    siupNumber: optionalStringSchema,
    phone: optionalStringSchema,
    email: z.string().email('Email tidak valid').optional().or(z.literal('')),
    ...addressBaseShape,
    postalCode: optionalStringSchema,
    contactPersonName: optionalStringSchema,
    contactPersonPhone: optionalStringSchema,
    contactPersonEmail: z.string().email('Email tidak valid').optional().or(z.literal('')),
    bankName: optionalStringSchema,
    bankAccountNumber: optionalStringSchema,
    bankAccountHolder: optionalStringSchema,
    notes: optionalStringSchema,
  })
  .refine((data) => data.isSubcontractor || data.isSupplier || data.isLogistic, {
    message: 'Pilih minimal satu tipe vendor',
    path: ['isSubcontractor'],
  });

export const editVendorSchema = createVendorSchema;

export const vendorItemCatalogSchema = z.object({
  itemCatalogId: requiredSelectSchema('Item wajib dipilih'),
  price: z.number({ message: 'Harga harus lebih dari 0' }).min(1, 'Harga harus lebih dari 0'),
  isActive: z.boolean(),
});

export const vendorCapabilitySchema = z.object({
  skillCatalogId: requiredSelectSchema('Skill wajib dipilih'),
  isActive: z.boolean(),
});

export const vendorServiceCoverageSyncSchema = z.object({
  coverages: z
    .array(
      z.object({
        provinceId: requiredSelectSchema('Provinsi wajib dipilih'),
        cityIds: z.array(z.string()).optional().default([]),
      })
    )
    .min(1, 'Minimal satu coverage wajib diisi'),
});

export const vendorOfferingDocumentSchema = z.object({
  files: z.array(z.instanceof(File)).optional().default([]),
  files__existingIds: z.array(z.string()).optional().default([]),
  code: z.string().min(1, 'Kode document wajib diisi'),
  title: z.string().min(1, 'Nama document wajib diisi'),
  periodStart: z.string().min(1, 'Tanggal mulai periode wajib diisi'),
  periodEnd: z.string().min(1, 'Tanggal akhir periode wajib diisi'),
  description: z.string().optional(),
  isActive: z.boolean(),
});

export const vendorFleetVehicleSchema = z.object({
  name: z.string().min(1, 'Nama armada wajib diisi'),
  code: z.string().min(1, 'Kode armada wajib diisi'),
  vehicleType: requiredSelectSchema('Tipe kendaraan wajib dipilih'),
  plateNumber: z.string().min(1, 'Plat nomor wajib diisi'),
  brand: z.string().optional(),
  model: z.string().optional(),
  yearOfManufacture: z.number().optional(),
  weightMax: z.number().optional(),
  weightUomId: optionalStringSchema,
  volumeMax: z.number().optional(),
  volumeUomId: optionalStringSchema,
  pricePerTripMin: z.number().optional(),
  pricePerDistanceMin: z.number().optional(),
  pricePerDistanceMax: z.number().optional(),
  distanceValueMin: z.number().optional(),
  distanceValueMax: z.number().optional(),
  distanceUomId: optionalStringSchema,
  notes: z.string().optional(),
  isActive: z.boolean(),
});
