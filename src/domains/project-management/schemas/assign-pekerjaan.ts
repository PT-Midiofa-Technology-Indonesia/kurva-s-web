import { z } from 'zod';

/**
 * One manpower card of the Assign Pekerjaan dialog.
 *
 * `targetQty` arrives as the raw number-input string (the input can be empty mid-edit), so it is
 * coerced here: an empty input becomes `Number('') === 0` and fails `.positive()` with the card
 * message instead of slipping a 0 target into the payload.
 */
export const manpowerCardSchema = z.object({
  employeeId: z.string().min(1, 'Nama wajib dipilih'),
  targetQty: z.coerce.number().positive('Target harus lebih dari 0'),
  helperEmployeeIds: z.array(z.string()).default([]),
  note: z.string().optional(),
});

export const assignPekerjaanSchema = z.object({
  manpowers: z.array(manpowerCardSchema).min(1, 'Minimal 1 manpower'),
});

/** What the dialog collects from its card drafts. */
export type AssignPekerjaanInput = z.input<typeof assignPekerjaanSchema>;
/** What the dialog sends to `useAssignLeafManpower` (targetQty coerced to number). */
export type AssignPekerjaanPayload = z.output<typeof assignPekerjaanSchema>;
