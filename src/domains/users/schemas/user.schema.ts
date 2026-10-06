import { z } from 'zod';
import { isActiveSchema, nameRequiredSchema } from '@/shared/schemas/common';
import { requiredEmailSchema } from '@/shared/schemas/email';
import { requiredPhoneNumberSchema } from '@/shared/schemas/phone';
import type { CreateUserPayload } from '../types';

export const userFormSchema = z.object({
  userType: z.enum(['employee', 'non_employee'], 'Tipe user wajib dipilih'),
  roleId: z.string('Role wajib dipilih').min(1, 'Role wajib dipilih'),
  isActive: isActiveSchema,
  name: nameRequiredSchema,
  email: requiredEmailSchema,
  phone: requiredPhoneNumberSchema,
  password: z.string('Password wajib diisi').min(1, 'Password wajib diisi'),
  address: z.string().max(500).optional(),
  companyId: z.union([z.string(), z.null()]).optional(),
  employeeId: z.union([z.string(), z.null()]).optional(),
});

export const userFormSchemaEdit = userFormSchema.extend({
  password: z.string().optional(),
});

export const createUserSchema: z.ZodType<CreateUserPayload, any, any> = userFormSchema
  .transform((data) => ({
    userType: data.userType as 'employee' | 'non_employee',
    name: data.name,
    email: data.email,
    phone: data.phone,
    roleId: data.roleId,
    isActive: data.isActive === '1',
    password: data.password,
    companyId: data.companyId ?? null,
    employeeId: data.employeeId ?? null,
  }))
  .refine((data) => data.roleId.length > 0, {
    message: 'Role wajib dipilih',
    path: ['roleId'],
  })
  .refine((data) => data.isActive !== undefined, {
    message: 'Status wajib dipilih',
    path: ['isActive'],
  })
  .refine(
    (data) => {
      if (data.userType === 'employee') {
        return typeof data.companyId === 'string' && data.companyId.length > 0;
      }
      return true;
    },
    { message: 'Company wajib dipilih', path: ['companyId'] }
  )
  .refine(
    (data) => {
      if (data.userType === 'employee') {
        return typeof data.employeeId === 'string' && data.employeeId.length > 0;
      }
      return true;
    },
    { message: 'Employee wajib dipilih', path: ['employeeId'] }
  );

export const createUserSchemaEdit: z.ZodType<CreateUserPayload, any, any> = userFormSchemaEdit
  .transform((data) => ({
    userType: data.userType as 'employee' | 'non_employee',
    name: data.name,
    email: data.email,
    phone: data.phone,
    roleId: data.roleId,
    isActive: data.isActive === '1',
    password: data.password ?? '',
    companyId: data.companyId ?? null,
    employeeId: data.employeeId ?? null,
  }))
  .refine((data) => data.roleId.length > 0, {
    message: 'Role wajib dipilih',
    path: ['roleId'],
  })
  .refine((data) => data.isActive !== undefined, {
    message: 'Status wajib dipilih',
    path: ['isActive'],
  })
  .refine(
    (data) => {
      if (data.userType === 'employee') {
        return typeof data.companyId === 'string' && data.companyId.length > 0;
      }
      return true;
    },
    { message: 'Company wajib dipilih', path: ['companyId'] }
  )
  .refine(
    (data) => {
      if (data.userType === 'employee') {
        return typeof data.employeeId === 'string' && data.employeeId.length > 0;
      }
      return true;
    },
    { message: 'Employee wajib dipilih', path: ['employeeId'] }
  );

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UserFormInput = z.infer<typeof userFormSchema>;
