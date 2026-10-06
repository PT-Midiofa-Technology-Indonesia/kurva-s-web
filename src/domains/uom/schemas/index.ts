import { z } from 'zod';
import {
  codeRequiredSchema,
  descriptionOptionalSchema,
  isActiveSchema,
  nameRequiredSchema,
  requiredSelectSchema,
} from '@/shared/schemas/common';

export const createUomSchema = z.object({
  code: codeRequiredSchema,
  group: requiredSelectSchema('Kelompok wajib diisi'),
  name: nameRequiredSchema,
  description: descriptionOptionalSchema,
  isActive: isActiveSchema,
});

export const editUomSchema = z.object({
  code: codeRequiredSchema,
  group: requiredSelectSchema('Kelompok wajib diisi'),
  name: nameRequiredSchema,
  description: descriptionOptionalSchema,
  isActive: isActiveSchema,
});
