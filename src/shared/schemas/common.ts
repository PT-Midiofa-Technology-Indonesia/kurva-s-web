import { z } from 'zod';
import { isActiveSchema } from './is-active';

// Re-export commonly used schemas from shared modules
export { isActiveSchema };

// ── Common required fields ─────────────────────────────────────
export const codeRequiredSchema = z.string().min(1, 'Kode wajib diisi');
export const nameRequiredSchema = z.string().min(1, 'Nama wajib diisi');
export const descriptionOptionalSchema = z.string().optional();
export const groupRequiredSchema = z.string().min(1, 'Kelompok wajib diisi');

// ── Fields with max length ─────────────────────────────────────
export const codeWithMaxSchema = z
  .string()
  .min(1, 'Kode wajib diisi')
  .max(50, 'Kode maksimal 50 karakter');
export const nameWithMaxSchema = z
  .string()
  .min(1, 'Nama wajib diisi')
  .max(255, 'Nama maksimal 255 karakter');

// ── Nullable / optional helpers ──────────────────────────────────
// Accept null (from AsyncSelect clear) and undefined, but the parsed
// output is `string | undefined` (null is coerced to undefined) so
// downstream API payloads and form input types stay aligned.
const nullToUndefined = (v: string | null | undefined) => v ?? undefined;

export const nullableIdSchema = z.string().nullable().optional().transform(nullToUndefined);
export const optionalStringSchema = z.string().nullable().optional().transform(nullToUndefined);
export const optionalOrEmptyStringSchema = z
  .string()
  .nullable()
  .optional()
  .or(z.literal(''))
  .transform(nullToUndefined);
export const parentIdOptionalSchema = z.string().nullable().optional().transform(nullToUndefined);

// ── Required select helper ─────────────────────────────────────
// Accepts null (the value AsyncSelect emits on clear) but rejects
// null/empty with a meaningful error so submit still surfaces "wajib diisi".
// Output is always string (null is transformed to '') so form input
// types and API payloads remain `string`.
export const requiredSelectSchema = (message: string) =>
  z
    .string()
    .nullable()
    .transform((v) => v ?? '')
    .refine((v) => v.length > 0, { message });

// ── Boolean string (for toggle/select fields) ──────────────────
// Nullable so clearing a Ya/Tidak toggle is allowed; null is coerced
// to 'false' so the form payload and API type stay `string`.
export const booleanStringSchema = z
  .string()
  .nullable()
  .transform((v) => v ?? 'false');

// ── Address field shapes ─────────────────────────────────────────
export const addressBaseShape = {
  provinceId: nullableIdSchema,
  cityId: nullableIdSchema,
  districtId: nullableIdSchema,
  villageId: nullableIdSchema,
  addressDetail: optionalStringSchema,
} as const;

export const addressEditBaseShape = {
  provinceId: nullableIdSchema,
  cityId: nullableIdSchema,
  districtId: nullableIdSchema,
  villageId: nullableIdSchema,
  addressDetail: optionalOrEmptyStringSchema,
} as const;

// ── Simple CRUD schemas (code + name + description + isActive) ─
export const simpleCreateSchema = z.object({
  code: codeRequiredSchema,
  name: nameRequiredSchema,
  description: descriptionOptionalSchema,
  isActive: isActiveSchema,
});

export const simpleEditSchema = z.object({
  code: codeRequiredSchema,
  name: nameRequiredSchema,
  description: descriptionOptionalSchema,
  isActive: isActiveSchema,
});

// ── Simple CRUD with max length ────────────────────────────────
export const simpleWithMaxCreateSchema = z.object({
  code: codeWithMaxSchema,
  name: nameWithMaxSchema,
  description: descriptionOptionalSchema,
  isActive: isActiveSchema,
});

export const simpleWithMaxEditSchema = z.object({
  code: codeWithMaxSchema,
  name: nameWithMaxSchema,
  description: descriptionOptionalSchema,
  isActive: isActiveSchema,
});
