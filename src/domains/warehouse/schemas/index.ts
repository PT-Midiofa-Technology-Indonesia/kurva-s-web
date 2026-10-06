import { z } from 'zod';
import {
  addressBaseShape,
  addressEditBaseShape,
  codeRequiredSchema,
  isActiveSchema,
  nameRequiredSchema,
  requiredSelectSchema,
} from '@/shared/schemas/common';

const attendanceRadiusSchema = z
  .string()
  .min(1, 'Radius absensi wajib diisi')
  .regex(/^\d+$/, 'Radius absensi harus berupa angka bulat');

const workTimeSchema = z
  .union([z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Format jam harus HH:mm'), z.literal('')])
  .optional();

export const createWarehouseSchema = z.object({
  companyId: requiredSelectSchema('Company wajib dipilih'),
  code: codeRequiredSchema,
  name: nameRequiredSchema,
  type: requiredSelectSchema('Type wajib dipilih'),
  isActive: isActiveSchema,
  ...addressBaseShape,
  provinceId: requiredSelectSchema('Provinsi wajib dipilih'),
  latitude: z.string().min(1, 'Latitude wajib diisi'),
  longitude: z.string().min(1, 'Longitude wajib diisi'),
  workStartTime: workTimeSchema,
  workEndTime: workTimeSchema,
  workDays: z.array(z.string()).optional(),
  attendanceRadiusMeters: attendanceRadiusSchema,
});

export const editWarehouseSchema = z.object({
  companyId: z.string().min(1, 'Company wajib dipilih').optional(),
  code: codeRequiredSchema.optional(),
  name: nameRequiredSchema.optional(),
  type: z.string().min(1, 'Type wajib dipilih').optional(),
  isActive: isActiveSchema,
  ...addressEditBaseShape,
  provinceId: requiredSelectSchema('Provinsi wajib dipilih'),
  latitude: z.string().min(1, 'Latitude wajib diisi'),
  longitude: z.string().min(1, 'Longitude wajib diisi'),
  workStartTime: workTimeSchema,
  workEndTime: workTimeSchema,
  workDays: z.array(z.string()).optional(),
  attendanceRadiusMeters: attendanceRadiusSchema,
});

export type WarehouseFormInput = z.infer<typeof createWarehouseSchema>;
