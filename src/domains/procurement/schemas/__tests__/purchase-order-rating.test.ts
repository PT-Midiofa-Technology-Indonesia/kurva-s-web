import { describe, expect, it } from 'vitest';
import { createPurchaseOrderRatingSchema } from '../purchase-order-rating';

describe('createPurchaseOrderRatingSchema', () => {
  it('rejects a future ratedAt and missing active categories', () => {
    const schema = createPurchaseOrderRatingSchema(['cat-1', 'cat-2']);
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + 1);

    const result = schema.safeParse({
      ratedAt: futureDate.toISOString().slice(0, 10),
      categoryScores: [{ categoryId: 'cat-1', score: 5, note: null }],
    });

    expect(result.success).toBe(false);
    const fieldErrors = result.error?.flatten().fieldErrors;
    expect(fieldErrors?.ratedAt ?? []).toContain('Tanggal rating tidak boleh di masa depan.');
    expect(fieldErrors?.categoryScores ?? []).toContain('Semua kategori rating aktif wajib diisi.');
  });

  it('accepts yyyy-mm-dd ratedAt with all active categories present', () => {
    const schema = createPurchaseOrderRatingSchema(['cat-1', 'cat-2']);

    const result = schema.safeParse({
      ratedAt: '2026-07-17',
      overallNote: null,
      categoryScores: [
        { categoryId: 'cat-1', score: 5, note: 'Baik' },
        { categoryId: 'cat-2', score: 4, note: null },
      ],
    });

    expect(result.success).toBe(true);
  });

  it('rejects malformed ratedAt values that are not yyyy-mm-dd', () => {
    const schema = createPurchaseOrderRatingSchema(['cat-1']);

    const result = schema.safeParse({
      ratedAt: '2026-7-2',
      categoryScores: [{ categoryId: 'cat-1', score: 5, note: null }],
    });

    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.ratedAt ?? []).toContain(
      'Tanggal rating harus berformat YYYY-MM-DD.'
    );
  });

  it('rejects duplicate active categories', () => {
    const schema = createPurchaseOrderRatingSchema(['cat-1', 'cat-2']);

    const result = schema.safeParse({
      ratedAt: '2026-07-17',
      categoryScores: [
        { categoryId: 'cat-1', score: 5, note: null },
        { categoryId: 'cat-1', score: 4, note: null },
      ],
    });

    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.categoryScores ?? []).toContain(
      'Setiap kategori rating aktif hanya boleh diisi satu kali.'
    );
  });
});
