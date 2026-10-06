import { z } from 'zod';

export const isActiveSchema = z
  .string()
  .nullable()
  .transform((v) => v ?? '')
  .refine((v) => v.length > 0, { message: 'Status wajib diisi' });
