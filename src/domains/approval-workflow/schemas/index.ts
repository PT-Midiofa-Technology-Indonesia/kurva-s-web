import { z } from 'zod';

export const approvalWorkflowStepSchema = z.object({
  stepOrder: z.number(),
  name: z.string(),
  approverType: z.string().min(1, 'Tipe approver wajib diisi'),
  approverId: z.string().min(1, 'Bagian wajib diisi'),
  picId: z.string().nullable().optional(),
  nominalThreshold: z.number().nullable().default(null),
  isActive: z.boolean(),
});

export const approvalWorkflowSettingsSchema = z.object({
  isFinance: z.boolean(),
  steps: z.array(approvalWorkflowStepSchema).min(1, 'Minimal satu langkah diperlukan'),
});

export type ApprovalWorkflowSettingsFormValues = z.infer<typeof approvalWorkflowSettingsSchema>;
export type ApprovalWorkflowStepFormValues = z.infer<typeof approvalWorkflowStepSchema>;
