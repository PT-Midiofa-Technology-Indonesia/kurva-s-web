import z from 'zod';
import {
  codeWithMaxSchema,
  descriptionOptionalSchema,
  nameWithMaxSchema,
  requiredSelectSchema,
} from '@/shared/schemas/common';

const booleanSelectSchema = z.enum(['true', 'false']);

export const createAssetCategorySchema = z.object({
  code: codeWithMaxSchema,
  name: nameWithMaxSchema,
  usefulLifeMonths: z.number().int().positive('Useful life harus lebih dari 0'),
  depreciationMethod: requiredSelectSchema('Metode depresiasi wajib dipilih'),
  salvageValuePercent: z
    .number()
    .min(0, 'Salvage value minimal 0')
    .max(100, 'Salvage value maksimal 100')
    .default(0),
  maintenanceIntervalMonths: z
    .number()
    .int()
    .positive('Interval maintenance harus lebih dari 0')
    .optional(),
  requiresSerial: booleanSelectSchema,
  notes: descriptionOptionalSchema,
  isActive: booleanSelectSchema,
});

export const updateAssetCategorySchema = z.object({
  name: nameWithMaxSchema,
  usefulLifeMonths: z.number().int().positive('Useful life harus lebih dari 0'),
  depreciationMethod: requiredSelectSchema('Metode depresiasi wajib dipilih'),
  salvageValuePercent: z
    .number()
    .min(0, 'Salvage value minimal 0')
    .max(100, 'Salvage value maksimal 100')
    .default(0),
  maintenanceIntervalMonths: z
    .number()
    .int()
    .positive('Interval maintenance harus lebih dari 0')
    .optional(),
  requiresSerial: booleanSelectSchema,
  notes: descriptionOptionalSchema,
  isActive: booleanSelectSchema,
});

export const createAssetRegistrationSchema = z.object({
  resourceUnitId: requiredSelectSchema('Unit aset wajib dipilih'),
  assetCategoryId: requiredSelectSchema('Asset category wajib dipilih'),
  depreciationStartDate: z.string().min(1, 'Tanggal mulai depresiasi wajib diisi'),
  salvageValue: z.number().min(0, 'Salvage value minimal 0').optional(),
  bookValueAtRegister: z.number().min(0, 'Book value minimal 0').optional(),
  serialNumber: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  confirm: z.boolean().optional(),
});

export const updateAssetRegistrationNotesSchema = z.object({
  notes: z.string().nullable().optional(),
});
