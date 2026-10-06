import { describe, expect, it } from 'vitest';
import { FILE_TYPE_OPTIONS, type FileTypeValue } from '../constants';
import { buildFileTypeFlags, buildFileTypesString, parseFileTypesString } from './file-types';

const ALL_VALUES: FileTypeValue[] = FILE_TYPE_OPTIONS.map((opt) => opt.value);

describe('file-types service', () => {
  describe('parseFileTypesString', () => {
    it('returns an empty array for null', () => {
      expect(parseFileTypesString(null)).toEqual([]);
    });

    it('returns an empty array for undefined', () => {
      expect(parseFileTypesString(undefined)).toEqual([]);
    });

    it('returns an empty array for an empty string', () => {
      expect(parseFileTypesString('')).toEqual([]);
    });

    it('parses a single value', () => {
      expect(parseFileTypesString('pdf')).toEqual(['pdf']);
    });

    it('parses multiple comma-separated values', () => {
      expect(parseFileTypesString('pdf,jpg,png')).toEqual(['pdf', 'jpg', 'png']);
    });

    it('trims whitespace around values', () => {
      expect(parseFileTypesString(' pdf , jpg , png ')).toEqual(['pdf', 'jpg', 'png']);
    });

    it('lowercases values', () => {
      expect(parseFileTypesString('PDF,JPG')).toEqual(['pdf', 'jpg']);
    });

    it('filters out unknown values', () => {
      expect(parseFileTypesString('pdf,unknown,exe')).toEqual(['pdf']);
    });

    it('ignores empty entries between separators', () => {
      expect(parseFileTypesString('pdf,,jpg')).toEqual(['pdf', 'jpg']);
    });
  });

  describe('buildFileTypesString', () => {
    it('returns an empty string when no values are checked', () => {
      expect(
        buildFileTypesString({
          pdf: false,
          jpg: false,
          jpeg: false,
          png: false,
          doc: false,
          docx: false,
          xls: false,
          xlsx: false,
        })
      ).toBe('');
    });

    it('joins checked values with commas', () => {
      expect(
        buildFileTypesString({
          pdf: true,
          jpg: true,
          jpeg: false,
          png: false,
          doc: false,
          docx: false,
          xls: false,
          xlsx: false,
        })
      ).toBe('pdf,jpg');
    });

    it('preserves the input key order', () => {
      const input: Partial<Record<FileTypeValue, boolean>> = {
        jpg: true,
        pdf: true,
        jpeg: false,
        png: false,
        doc: false,
        docx: false,
        xls: false,
        xlsx: false,
      };
      expect(buildFileTypesString(input)).toBe('jpg,pdf');
    });
  });

  describe('buildFileTypeFlags', () => {
    it('returns all false for null', () => {
      const flags = buildFileTypeFlags(null);
      for (const v of ALL_VALUES) {
        expect(flags[v]).toBe(false);
      }
    });

    it('returns all false for undefined', () => {
      const flags = buildFileTypeFlags(undefined);
      for (const v of ALL_VALUES) {
        expect(flags[v]).toBe(false);
      }
    });

    it('returns all false for empty string', () => {
      const flags = buildFileTypeFlags('');
      for (const v of ALL_VALUES) {
        expect(flags[v]).toBe(false);
      }
    });

    it('marks the parsed values as true and the rest as false', () => {
      const flags = buildFileTypeFlags('pdf,png');
      expect(flags.pdf).toBe(true);
      expect(flags.png).toBe(true);
      expect(flags.jpg).toBe(false);
      expect(flags.jpeg).toBe(false);
      expect(flags.doc).toBe(false);
      expect(flags.docx).toBe(false);
      expect(flags.xls).toBe(false);
      expect(flags.xlsx).toBe(false);
    });

    it('ignores unknown values when building flags', () => {
      const flags = buildFileTypeFlags('pdf,unknown');
      expect(flags.pdf).toBe(true);
      for (const v of ALL_VALUES) {
        if (v !== 'pdf') {
          expect(flags[v]).toBe(false);
        }
      }
    });
  });

  describe('round-trip', () => {
    it('parse(build({...})) returns the same set of values', () => {
      const input: Partial<Record<FileTypeValue, boolean>> = {
        pdf: true,
        jpg: false,
        jpeg: true,
        png: false,
        doc: false,
        docx: true,
        xls: false,
        xlsx: false,
      };
      const built = buildFileTypesString(input);
      const parsed = parseFileTypesString(built);
      expect(parsed.sort()).toEqual(['docx', 'jpeg', 'pdf'].sort());
    });

    it('buildFileTypesString(buildFileTypeFlags(x)) produces the same string for canonical values', () => {
      const original = 'pdf,jpg,png';
      const flags = buildFileTypeFlags(original);
      expect(buildFileTypesString(flags)).toBe(original);
    });
  });
});
