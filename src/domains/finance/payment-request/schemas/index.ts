import { z } from 'zod';

// ============================================================================
// Payment Form Schema
// ============================================================================

export const paymentFormSchema = z
  .object({
    paymentDate: z.date().optional(),
    amount: z.number().min(1, 'Amount harus lebih dari 0'),
    paymentMethod: z.string().min(1, 'Payment method wajib dipilih'),
    transferVia: z.string().optional(),
    checkNumber: z.string().optional(),
    checkIssueDate: z.date().optional(),
    checkEffectiveDate: z.date().optional(),
    notes: z.string().max(500, 'Maksimal 500 karakter').optional(),
  })
  .superRefine((values, ctx) => {
    if (values.paymentMethod === 'transfer' && !values.transferVia?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Transfer via wajib diisi',
        path: ['transferVia'],
      });
    }

    if (values.paymentMethod === 'giro') {
      if (!values.checkNumber?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Nomor giro/cek wajib diisi',
          path: ['checkNumber'],
        });
      }

      if (!values.checkIssueDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Tanggal terbit wajib diisi',
          path: ['checkIssueDate'],
        });
      }

      if (!values.checkEffectiveDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Tanggal efektif wajib diisi',
          path: ['checkEffectiveDate'],
        });
      }
    }
  });

export type PaymentFormValues = z.infer<typeof paymentFormSchema>;
