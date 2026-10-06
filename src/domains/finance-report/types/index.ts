import type { z } from 'zod';
import type {
  financeReportDataSchema,
  financeReportItemSchema,
  financeReportResponseSchema,
  financeReportSummarySchema,
  financeReportTypeSchema,
} from '../schemas';

export type FinanceReportType = z.infer<typeof financeReportTypeSchema>;
export type FinanceReportSummary = z.infer<typeof financeReportSummarySchema>;
export type FinanceReportItem = z.infer<typeof financeReportItemSchema>;
export type FinanceReportData = z.infer<typeof financeReportDataSchema>;
export type FinanceReportResponse = z.infer<typeof financeReportResponseSchema>;

export interface FinanceReportDetail {
  code: string;
  source: string;
  reference: string;
  amount: number;
  transactionDate: string | null;
  type: FinanceReportType;
  note: string | null;
}
