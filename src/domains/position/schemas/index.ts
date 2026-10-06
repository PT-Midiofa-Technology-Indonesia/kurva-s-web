import { z } from 'zod';
import { codeRequiredSchema, isActiveSchema, nameRequiredSchema } from '@/shared/schemas/common';

const levelSchema = z
  .union([z.string(), z.number()])
  .transform((v) => String(v))
  .refine((v) => v.length > 0, { message: 'Level wajib diisi' });

const skillCatalogIdsSchema = z.array(z.string()).default([]);

export const createPositionSchema = z.object({
  code: codeRequiredSchema,
  name: nameRequiredSchema,
  level: levelSchema,
  isActive: isActiveSchema,
  skillCatalogIds: skillCatalogIdsSchema,
});

export const editPositionSchema = z.object({
  code: codeRequiredSchema,
  name: nameRequiredSchema,
  level: levelSchema,
  isActive: isActiveSchema,
  skillCatalogIds: skillCatalogIdsSchema,
});
