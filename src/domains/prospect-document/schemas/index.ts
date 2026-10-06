import { z } from 'zod';

const documentRequirementSchema = z.object({
  documentTypeId: z.string(),
  isMandatory: z.boolean(),
});

export const syncProspectStageDocumentSchema = z.object({
  documentRequirements: z
    .array(documentRequirementSchema)
    .min(1, 'Minimal satu dokumen harus dipilih'),
});

export type SyncProspectStageDocumentFormInput = z.infer<typeof syncProspectStageDocumentSchema>;
