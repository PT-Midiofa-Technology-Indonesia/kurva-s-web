import { z } from 'zod';

export const approvalDecisionSchema = z.object({
  comment: z.string().min(1, 'Alasan wajib diisi').max(1000, 'Maksimal 1000 karakter'),
});

export const approvalApproveSchema = z.object({
  comment: z.string().max(1000, 'Maksimal 1000 karakter'),
});

export type ApprovalDecisionFormValues = z.infer<typeof approvalDecisionSchema>;
export type ApprovalApproveFormValues = z.infer<typeof approvalApproveSchema>;
