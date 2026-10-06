import { z } from 'zod';

export const positionAssignmentSchema = z.object({
  assignments: z.array(
    z.object({
      companyId: z.string().min(1, 'Company harus dipilih'),
      companyPositionId: z.string().min(1, 'Job Position harus dipilih'),
    })
  ),
});

export type PositionAssignmentFormInput = z.infer<typeof positionAssignmentSchema>;
