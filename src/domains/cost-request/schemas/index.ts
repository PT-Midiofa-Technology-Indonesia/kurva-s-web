import { z } from 'zod';
import { COST_REQUEST_LABELS } from '../constants';

export const costRequestItemSchema = z.object({
  id: z.string().optional(),
  description: z.string().min(1, 'Deskripsi item wajib diisi'),
  receiptNumber: z.string().optional().default(''),
  amount: z.coerce.number().gt(0, COST_REQUEST_LABELS.VALIDATION.AMOUNT_POSITIVE),
  notes: z.string().optional().default(''),
  proofFiles: z.array(z.instanceof(File)).optional().default([]),
  existingProofs: z
    .array(
      z.object({
        id: z.string(),
        fileName: z.string(),
        fileSize: z.number().optional(),
        url: z.string(),
      })
    )
    .optional()
    .default([]),
});

export type CostRequestItemFormValues = z.infer<typeof costRequestItemSchema>;

export const createCostRequestSchema = z
  .object({
    requestType: z.enum(['project', 'non_project']),
    projectId: z.string().optional().default(''),
    employeeId: z.string().min(1, 'Employee wajib dipilih'),
    dueDate: z.date({ message: 'Due date wajib diisi' }),
    reason: z.string().optional().default(''),
    paymentMethod: z.enum(['cash', 'transfer', 'check'], {
      message: 'Metode pembayaran wajib dipilih',
    }),
    notes: z.string().optional().default(''),
    items: z.array(costRequestItemSchema).min(1, COST_REQUEST_LABELS.VALIDATION.ITEMS_REQUIRED),
  })
  .superRefine((val, ctx) => {
    if (val.requestType === 'project' && !val.projectId) {
      ctx.addIssue({
        code: 'custom',
        path: ['projectId'],
        message: COST_REQUEST_LABELS.VALIDATION.PROJECT_REQUIRED,
      });
    }
  });

export type CreateCostRequestFormValues = z.infer<typeof createCostRequestSchema>;

// Edit path — requestType/projectId/employeeId are immutable per the confirmed PUT contract.
export const editCostRequestHeaderSchema = z.object({
  dueDate: z.date({ message: 'Due date wajib diisi' }),
  reason: z.string().optional().default(''),
  paymentMethod: z.enum(['cash', 'transfer', 'check'], {
    message: 'Metode pembayaran wajib dipilih',
  }),
  notes: z.string().optional().default(''),
  items: z.array(costRequestItemSchema).min(1, COST_REQUEST_LABELS.VALIDATION.ITEMS_REQUIRED),
});

export type EditCostRequestHeaderFormValues = z.infer<typeof editCostRequestHeaderSchema>;
