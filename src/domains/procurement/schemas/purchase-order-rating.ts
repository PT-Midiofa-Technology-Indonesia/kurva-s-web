import { format } from 'date-fns';
import { z } from 'zod';
import type { PurchaseOrderRatingPayload } from '../types/purchase-order-rating';

const ratingNoteSchema = z.union([z.string(), z.null()]).optional();
const ratedAtPattern = /^\d{4}-\d{2}-\d{2}$/;

const categoryScoreSchema = z.object({
  categoryId: z.string().min(1, 'Kategori tidak ditemukan.'),
  score: z.coerce
    .number()
    .int('Skor harus antara 1 sampai 5.')
    .min(1, 'Skor harus antara 1 sampai 5.')
    .max(5, 'Skor harus antara 1 sampai 5.'),
  note: ratingNoteSchema,
});

export function createPurchaseOrderRatingSchema(activeCategoryIds: string[]) {
  const activeCategorySet = new Set(activeCategoryIds);

  return z
    .object({
      ratedAt: z.string().min(1, 'Tanggal rating wajib diisi.'),
      overallNote: z.union([z.string(), z.null()]).optional(),
      categoryScores: z.array(categoryScoreSchema).min(1, 'Skor kategori wajib diisi.'),
    })
    .superRefine((value, ctx) => {
      const parsedRatedAt = new Date(`${value.ratedAt}T00:00:00`);
      const hasValidCalendarDate =
        ratedAtPattern.test(value.ratedAt) &&
        !Number.isNaN(parsedRatedAt.getTime()) &&
        format(parsedRatedAt, 'yyyy-MM-dd') === value.ratedAt;

      if (!hasValidCalendarDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['ratedAt'],
          message: 'Tanggal rating harus berformat YYYY-MM-DD.',
        });
        return;
      }

      const todayValue = format(new Date(), 'yyyy-MM-dd');

      if (value.ratedAt > todayValue) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['ratedAt'],
          message: 'Tanggal rating tidak boleh di masa depan.',
        });
      }

      if (activeCategoryIds.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['categoryScores'],
          message: 'Belum ada kategori rating aktif.',
        });
        return;
      }

      const submittedCategoryIds = value.categoryScores.map((item) => item.categoryId);
      const submittedIds = new Set(submittedCategoryIds);
      const hasInvalidCategory = value.categoryScores.some(
        (item) => !activeCategorySet.has(item.categoryId)
      );
      const hasDuplicateCategory = submittedIds.size !== submittedCategoryIds.length;
      const hasMissingCategory = activeCategoryIds.some((id) => !submittedIds.has(id));

      if (hasInvalidCategory) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['categoryScores'],
          message: 'Terdapat kategori yang tidak valid atau tidak aktif.',
        });
      }

      if (hasDuplicateCategory) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['categoryScores'],
          message: 'Setiap kategori rating aktif hanya boleh diisi satu kali.',
        });
      }

      if (hasMissingCategory || submittedIds.size !== activeCategorySet.size) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['categoryScores'],
          message: 'Semua kategori rating aktif wajib diisi.',
        });
      }
    });
}

export type PurchaseOrderRatingFormValues = z.infer<
  ReturnType<typeof createPurchaseOrderRatingSchema>
>;

export type { PurchaseOrderRatingPayload };
