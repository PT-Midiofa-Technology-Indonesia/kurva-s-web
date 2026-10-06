import { z } from 'zod';
import { isActiveSchema } from '@/shared/schemas/is-active';

const codeRequiredSchema = z
  .string()
  .min(1, 'Kode wajib diisi')
  .max(100, 'Kode maksimal 100 karakter');

const nameRequiredSchema = z
  .string()
  .min(1, 'Nama wajib diisi')
  .max(255, 'Nama maksimal 255 karakter');

const descriptionOptionalSchema = z.string().optional().or(z.literal(''));

const fileTypeItemSchema = z.boolean();

const allowedFileSizeSchema = z
  .union([z.number().int().min(0, 'Ukuran file minimal 0'), z.nan()])
  .optional()
  .transform((v) => (Number.isNaN(v) || v === undefined ? undefined : v));

export const createDocumentTypeSchema = z.object({
  code: codeRequiredSchema,
  name: nameRequiredSchema,
  description: descriptionOptionalSchema,
  fileTypePdf: fileTypeItemSchema.optional(),
  fileTypeJpg: fileTypeItemSchema.optional(),
  fileTypeJpeg: fileTypeItemSchema.optional(),
  fileTypePng: fileTypeItemSchema.optional(),
  fileTypeDoc: fileTypeItemSchema.optional(),
  fileTypeDocx: fileTypeItemSchema.optional(),
  fileTypeXls: fileTypeItemSchema.optional(),
  fileTypeXlsx: fileTypeItemSchema.optional(),
  allowedFileSize: allowedFileSizeSchema,
  isActive: isActiveSchema,
});

export const editDocumentTypeSchema = z.object({
  code: codeRequiredSchema,
  name: nameRequiredSchema,
  description: descriptionOptionalSchema,
  fileTypePdf: fileTypeItemSchema.optional(),
  fileTypeJpg: fileTypeItemSchema.optional(),
  fileTypeJpeg: fileTypeItemSchema.optional(),
  fileTypePng: fileTypeItemSchema.optional(),
  fileTypeDoc: fileTypeItemSchema.optional(),
  fileTypeDocx: fileTypeItemSchema.optional(),
  fileTypeXls: fileTypeItemSchema.optional(),
  fileTypeXlsx: fileTypeItemSchema.optional(),
  allowedFileSize: allowedFileSizeSchema,
  isActive: isActiveSchema,
});

export type CreateDocumentTypeFormInput = z.infer<typeof createDocumentTypeSchema>;
export type EditDocumentTypeFormInput = z.infer<typeof editDocumentTypeSchema>;
