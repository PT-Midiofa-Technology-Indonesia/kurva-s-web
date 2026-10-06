import { z } from 'zod';

export const createPayrollDraftSchema = z
  .object({
    periodType: z.enum(['monthly', 'daily', 'hourly']),
    periodStart: z.string().min(1, 'Period start wajib diisi'),
    periodEnd: z.string().min(1, 'Period end wajib diisi'),
    notes: z.string().optional(),
  })
  .refine((data) => data.periodEnd >= data.periodStart, {
    message: 'Period end harus sama atau setelah period start',
    path: ['periodEnd'],
  });

export type CreatePayrollDraftFormValues = z.infer<typeof createPayrollDraftSchema>;
