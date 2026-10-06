import { z } from 'zod';

const EMAIL_ERROR_MESSAGE = 'Format email tidak valid';
const EMAIL_REQUIRED_MESSAGE = 'Email wajib diisi';

/**
 * Optional email schema — validates email format if provided.
 * Allows empty string and undefined.
 */
export const optionalEmailSchema = z
  .string()
  .email(EMAIL_ERROR_MESSAGE)
  .optional()
  .or(z.literal(''));

/**
 * Required email schema — validates email format, must not be empty.
 */
export const requiredEmailSchema = z
  .string(EMAIL_REQUIRED_MESSAGE)
  .min(1, EMAIL_REQUIRED_MESSAGE)
  .email(EMAIL_ERROR_MESSAGE);
