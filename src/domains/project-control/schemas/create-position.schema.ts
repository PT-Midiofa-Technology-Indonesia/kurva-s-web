import { z } from 'zod';
import { requiredSelectSchema } from '@/shared/schemas/common';

export const createPositionSchema = z.object({
  positionId: requiredSelectSchema('Job Position wajib dipilih'),
  parentId: z.string().nullable(),
  status: z.string().min(1, 'Status wajib dipilih'),
});

export type CreatePositionInput = z.infer<typeof createPositionSchema>;
