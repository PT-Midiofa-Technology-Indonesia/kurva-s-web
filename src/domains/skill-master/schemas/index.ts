import { z } from 'zod';
import {
  codeRequiredSchema,
  descriptionOptionalSchema,
  isActiveSchema,
  nameRequiredSchema,
  requiredSelectSchema,
} from '@/shared/schemas/common';

export const skillCategorySchema = z.object({
  code: codeRequiredSchema.max(50),
  name: nameRequiredSchema.max(255),
  description: z.string().optional().default(''),
  groupId: z.string().nullable().optional(),
  isActive: z.boolean().optional().default(true),
});

export type SkillCategoryFormData = z.infer<typeof skillCategorySchema>;

export const createSkillCategoryFormSchema = z.object({
  code: codeRequiredSchema,
  name: nameRequiredSchema,
  description: descriptionOptionalSchema,
  isActive: isActiveSchema,
});

export const editSkillCategoryFormSchema = z.object({
  code: codeRequiredSchema,
  name: nameRequiredSchema,
  description: descriptionOptionalSchema,
  isActive: isActiveSchema,
});

export const skillCatalogSchema = z.object({
  groupId: z.string().nullable().optional(),
  skillCategoryId: requiredSelectSchema('Kategori skill wajib dipilih'),
  skillLevelId: requiredSelectSchema('Skill level wajib dipilih'),
  code: codeRequiredSchema.max(50),
  name: nameRequiredSchema.max(255),
  description: z.string().optional().default(''),
  isActive: z.boolean().optional().default(true),
});

export type SkillCatalogFormData = z.infer<typeof skillCatalogSchema>;

export const createSkillCatalogFormSchema = z.object({
  code: codeRequiredSchema,
  name: nameRequiredSchema,
  skillCategoryId: requiredSelectSchema('Kategori skill wajib dipilih'),
  skillLevelId: requiredSelectSchema('Skill level wajib dipilih'),
  description: descriptionOptionalSchema,
  isActive: isActiveSchema,
});

export const editSkillCatalogFormSchema = z.object({
  code: codeRequiredSchema,
  name: nameRequiredSchema,
  skillCategoryId: requiredSelectSchema('Kategori skill wajib dipilih'),
  skillLevelId: requiredSelectSchema('Skill level wajib dipilih'),
  description: descriptionOptionalSchema,
  isActive: isActiveSchema,
});
