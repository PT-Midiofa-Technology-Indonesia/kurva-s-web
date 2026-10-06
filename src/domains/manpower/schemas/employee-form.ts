import { z } from 'zod';
import { isActiveSchema, nameRequiredSchema } from '@/shared/schemas/common';
import { requiredEmailSchema } from '@/shared/schemas/email';
import { requiredPhoneNumberSchema } from '@/shared/schemas/phone';

const nullToString = (val: unknown) => (val === null || val === undefined ? '' : val);

export const employeeFormSchema = z.object({
  fullName: nameRequiredSchema,
  employeeType: z.preprocess(nullToString, z.string().min(1, 'Tipe karyawan wajib dipilih')),
  isActive: z.preprocess(nullToString, isActiveSchema),
  gender: z.preprocess(nullToString, z.string().min(1, 'Jenis kelamin wajib dipilih')),
  birthPlace: z.string().min(1, 'Tempat lahir wajib diisi'),
  birthDate: z.string().min(1, 'Tanggal lahir wajib diisi'),
  phone: requiredPhoneNumberSchema,
  email: requiredEmailSchema,
  provinceId: z.string().nullable().optional(),
  cityId: z.string().nullable().optional(),
  districtId: z.string().nullable().optional(),
  villageId: z.string().nullable().optional(),
  addressDetail: z.string().optional(),
});
