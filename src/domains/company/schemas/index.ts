import { z } from 'zod';
import {
  addressBaseShape,
  addressEditBaseShape,
  codeRequiredSchema,
  isActiveSchema,
  nameRequiredSchema,
  optionalOrEmptyStringSchema,
  optionalStringSchema,
} from '@/shared/schemas/common';
import { optionalEmailSchema } from '@/shared/schemas/email';
import { optionalPhoneNumberSchema } from '@/shared/schemas/phone';

export const createCompanySchema = z.object({
  code: codeRequiredSchema,
  name: nameRequiredSchema,
  npwp: optionalStringSchema,
  siupNumber: optionalStringSchema,
  projectCapabilityIds: z.array(z.string()).min(1, 'Project Capabilities wajib dipilih'),
  phone: optionalPhoneNumberSchema.optional(),
  email: optionalEmailSchema,
  isActive: isActiveSchema,
  ...addressBaseShape,
});

export const editCompanySchema = z.object({
  code: codeRequiredSchema.optional(),
  name: nameRequiredSchema.optional(),
  npwp: optionalOrEmptyStringSchema,
  siupNumber: optionalOrEmptyStringSchema,
  projectCapabilityIds: z.array(z.string()).optional(),
  phone: optionalPhoneNumberSchema.optional().or(z.literal('')),
  email: optionalEmailSchema,
  isActive: isActiveSchema,
  ...addressEditBaseShape,
});

export type CompanyFormInput = z.infer<typeof createCompanySchema>;

export const addDepartmentSchema = z.object({
  departmentIds: z.array(z.string()).min(1, 'Department wajib dipilih'),
});

export type AddDepartmentInput = z.infer<typeof addDepartmentSchema>;
