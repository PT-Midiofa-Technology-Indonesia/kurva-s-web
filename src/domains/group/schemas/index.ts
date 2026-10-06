import { z } from 'zod';
import {
  codeRequiredSchema,
  descriptionOptionalSchema,
  isActiveSchema,
} from '@/shared/schemas/common';

export const editGroupSchema = z.object({
  code: codeRequiredSchema,
  name: z.string().optional(),
  description: descriptionOptionalSchema,
  isActive: isActiveSchema,
});
