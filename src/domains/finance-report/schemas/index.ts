import { z } from 'zod';

export const financeReportTypeSchema = z.enum(['cash_in', 'cash_out']);

export const financeReportSummarySchema = z.object({
  totalCashIn: z.coerce.number(),
  totalCashOut: z.coerce.number(),
  netBalance: z.coerce.number(),
});

export const financeReportItemSchema = z.object({
  id: z.string(),
  code: z.string(),
  source: z.string(),
  sourceLabel: z.string(),
  reference: z.string().nullable().optional(),
  amount: z.coerce.number(),
  transactionDate: z.string(),
  type: financeReportTypeSchema,
  typeLabel: z.string(),
});

export const financeReportDataSchema = z.object({
  summary: financeReportSummarySchema,
  items: z.array(financeReportItemSchema),
});

export const financeReportResponseSchema = z.object({
  success: z.boolean(),
  data: financeReportDataSchema,
  meta: z.object({
    currentPage: z.coerce.number(),
    perPage: z.coerce.number(),
    total: z.coerce.number(),
    lastPage: z.coerce.number(),
    from: z.coerce.number().nullable(),
    to: z.coerce.number().nullable(),
  }),
});
