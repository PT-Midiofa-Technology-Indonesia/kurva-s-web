import { z } from 'zod';

export const createBillingSchema = z.object({
  projectId: z.string().min(1, 'Proyek wajib dipilih'),
  billingType: z.string().min(1, 'Tipe billing wajib diisi'),
  percentage: z.number().min(0).max(100).optional(),
  billedAt: z.string().min(1, 'Tanggal tagihan wajib diisi'),
  dueDate: z.string().min(1, 'Jatuh tempo wajib diisi'),
  notes: z.string().optional(),
  paymentMethods: z.array(z.string()).optional(),
  paymentTermDays: z.number().optional(),
  invoiceNumber: z.string().optional(),
  vatPercentage: z.number().optional(),
  withholdingPercentage: z.number().optional(),
  reviewNotes: z.string().optional(),
  progressItems: z
    .array(
      z.object({
        boqItemId: z.string().optional(),
        progress: z.number().min(0).max(100).optional(),
      })
    )
    .optional(),
});

export type CreateBillingFormValues = z.infer<typeof createBillingSchema>;
