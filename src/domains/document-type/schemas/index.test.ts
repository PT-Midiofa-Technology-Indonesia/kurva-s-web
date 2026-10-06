import { describe, expect, it } from 'vitest';
import { createDocumentTypeSchema, editDocumentTypeSchema } from './index';

describe('document-type schemas', () => {
  describe('createDocumentTypeSchema', () => {
    it('accepts a minimal valid payload', () => {
      const result = createDocumentTypeSchema.safeParse({
        code: 'DOC-01',
        name: 'KTP',
        isActive: 'true',
      });
      expect(result.success).toBe(true);
    });

    it('rejects an empty code', () => {
      const result = createDocumentTypeSchema.safeParse({
        code: '',
        name: 'KTP',
        isActive: 'true',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((i) => i.path[0] === 'code')).toBe(true);
      }
    });

    it('rejects an empty name', () => {
      const result = createDocumentTypeSchema.safeParse({
        code: 'DOC-01',
        name: '',
        isActive: 'true',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((i) => i.path[0] === 'name')).toBe(true);
      }
    });

    it('rejects a code longer than 100 characters', () => {
      const result = createDocumentTypeSchema.safeParse({
        code: 'A'.repeat(101),
        name: 'KTP',
        isActive: 'true',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((i) => i.path[0] === 'code')).toBe(true);
      }
    });

    it('rejects a name longer than 255 characters', () => {
      const result = createDocumentTypeSchema.safeParse({
        code: 'DOC-01',
        name: 'A'.repeat(256),
        isActive: 'true',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((i) => i.path[0] === 'name')).toBe(true);
      }
    });

    it('rejects when isActive is empty (Status wajib diisi)', () => {
      const result = createDocumentTypeSchema.safeParse({
        code: 'DOC-01',
        name: 'KTP',
        isActive: '',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((i) => i.path[0] === 'isActive')).toBe(true);
      }
    });

    it('accepts a full valid payload with file types and size', () => {
      const result = createDocumentTypeSchema.safeParse({
        code: 'DOC-01',
        name: 'KTP',
        description: 'Kartu Tanda Penduduk',
        fileTypePdf: true,
        fileTypeJpg: true,
        fileTypeJpeg: false,
        fileTypePng: false,
        fileTypeDoc: false,
        fileTypeDocx: false,
        fileTypeXls: false,
        fileTypeXlsx: false,
        allowedFileSize: 2048,
        isActive: 'true',
      });
      expect(result.success).toBe(true);
    });

    it('accepts a payload with allowedFileSize = 0', () => {
      const result = createDocumentTypeSchema.safeParse({
        code: 'DOC-01',
        name: 'KTP',
        allowedFileSize: 0,
        isActive: 'true',
      });
      expect(result.success).toBe(true);
    });

    it('rejects a negative allowedFileSize', () => {
      const result = createDocumentTypeSchema.safeParse({
        code: 'DOC-01',
        name: 'KTP',
        allowedFileSize: -1,
        isActive: 'true',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('editDocumentTypeSchema', () => {
    it('accepts the same minimal valid payload as create', () => {
      const result = editDocumentTypeSchema.safeParse({
        code: 'DOC-01',
        name: 'KTP',
        isActive: 'true',
      });
      expect(result.success).toBe(true);
    });

    it('rejects an empty code', () => {
      const result = editDocumentTypeSchema.safeParse({
        code: '',
        name: 'KTP',
        isActive: 'true',
      });
      expect(result.success).toBe(false);
    });

    it('rejects an empty name', () => {
      const result = editDocumentTypeSchema.safeParse({
        code: 'DOC-01',
        name: '',
        isActive: 'true',
      });
      expect(result.success).toBe(false);
    });

    it('rejects when isActive is empty', () => {
      const result = editDocumentTypeSchema.safeParse({
        code: 'DOC-01',
        name: 'KTP',
        isActive: '',
      });
      expect(result.success).toBe(false);
    });
  });
});
