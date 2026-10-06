import { z } from 'zod';
import { requiredSelectSchema } from '@/shared/schemas/common';

export const createProjectPositionSchema = z.object({
  positionId: requiredSelectSchema('Job Position wajib dipilih'),
  parentId: z.string().nullable(),
  status: z.string().min(1, 'Status wajib dipilih'),
  employeeIds: z.array(z.string()).default([]),
});

export type CreateProjectPositionInput = z.infer<typeof createProjectPositionSchema>;
