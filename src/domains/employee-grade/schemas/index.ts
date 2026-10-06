import { z } from 'zod';
import {
  codeRequiredSchema,
  descriptionOptionalSchema,
  isActiveSchema,
  nameRequiredSchema,
} from '@/shared/schemas/common';

export const createEmployeeGradeSchema = z.object({
  code: codeRequiredSchema,
  name: nameRequiredSchema,
  description: descriptionOptionalSchema,
  isActive: isActiveSchema,
});

export const editEmployeeGradeSchema = z.object({
  code: codeRequiredSchema,
  name: nameRequiredSchema,
  description: descriptionOptionalSchema,
  isActive: isActiveSchema,
});
