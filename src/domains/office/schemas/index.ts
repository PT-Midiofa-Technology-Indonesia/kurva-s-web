import { z } from 'zod';
import {
  addressBaseShape,
  addressEditBaseShape,
  codeRequiredSchema,
  isActiveSchema,
  nameRequiredSchema,
  requiredSelectSchema,
} from '@/shared/schemas/common';
import { optionalPhoneNumberSchema } from '@/shared/schemas/phone';

const attendanceRadiusSchema = z
  .string()
  .min(1, 'Radius absensi wajib diisi')
  .regex(/^\d+$/, 'Radius absensi harus berupa angka bulat');

const workTimeSchema = z
  .union([z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Format jam harus HH:mm'), z.literal('')])
  .optional();

export const createOfficeSchema = z.object({
  companyId: requiredSelectSchema('Company wajib dipilih'),
  code: codeRequiredSchema,
  name: nameRequiredSchema,
  type: requiredSelectSchema('Type office wajib dipilih'),
  phone: optionalPhoneNumberSchema.optional(),
  latitude: z.string().min(1, 'Latitude wajib diisi'),
  longitude: z.string().min(1, 'Longitude wajib diisi'),
  ...addressBaseShape,
  provinceId: requiredSelectSchema('Provinsi wajib dipilih'),
  isActive: isActiveSchema,
  workStartTime: workTimeSchema,
  workEndTime: workTimeSchema,
  workDays: z.array(z.string()).optional(),
  attendanceRadiusMeters: attendanceRadiusSchema,
});

export const editOfficeSchema = z.object({
  companyId: z.string().min(1, 'Company wajib dipilih').optional(),
  code: codeRequiredSchema.optional(),
  name: nameRequiredSchema.optional(),
  type: z.string().min(1, 'Type office wajib dipilih').optional(),
  phone: optionalPhoneNumberSchema.optional().or(z.literal('')),
  latitude: z.string().min(1, 'Latitude wajib diisi'),
  longitude: z.string().min(1, 'Longitude wajib diisi'),
  ...addressEditBaseShape,
  provinceId: requiredSelectSchema('Provinsi wajib dipilih'),
  isActive: isActiveSchema,
  workStartTime: workTimeSchema,
  workEndTime: workTimeSchema,
  workDays: z.array(z.string()).optional(),
  attendanceRadiusMeters: attendanceRadiusSchema,
});

export type OfficeFormInput = z.infer<typeof createOfficeSchema>;
