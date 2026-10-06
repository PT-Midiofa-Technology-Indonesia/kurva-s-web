import { z } from 'zod';

/**
 * Both thresholds are optional (BR-SM03).
 *
 * `min > max` is deliberately NOT validated here: the spec allows saving an
 * inconsistent range and surfacing it as a badge afterwards, so a `.refine()`
 * would block a submit the business rules permit. The warning is rendered from
 * the live form values instead.
 */
export const setThresholdSchema = z.object({
  minThreshold: z
    .union([z.number().min(0, 'Threshold tidak boleh negatif'), z.nan(), z.null()])
    .optional()
    .transform((v) => (v == null || Number.isNaN(v) ? null : v)),
  maxThreshold: z
    .union([z.number().min(0, 'Threshold tidak boleh negatif'), z.nan(), z.null()])
    .optional()
    .transform((v) => (v == null || Number.isNaN(v) ? null : v)),
});

export type SetThresholdInput = z.input<typeof setThresholdSchema>;
export type SetThresholdOutput = z.output<typeof setThresholdSchema>;
