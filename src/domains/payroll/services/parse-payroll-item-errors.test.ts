import { describe, expect, it } from 'vitest';
import { hasPayrollRowErrors, parsePayrollItemErrors } from './parse-payroll-item-errors';

const IDS = ['comp-a', 'comp-b', 'comp-c'];

describe('parsePayrollItemErrors', () => {
  it('maps an indexed error onto the component that sat at that index', () => {
    const result = parsePayrollItemErrors(
      { 'items.1.default_amount': ['Harus antara 0 dan 100.'] },
      IDS
    );

    expect(result).toEqual({ 'comp-b': { default_amount: 'Harus antara 0 dan 100.' } });
  });

  it('merges several fields of the same component', () => {
    const result = parsePayrollItemErrors(
      {
        'items.0.min_amount': ['Min salah.'],
        'items.0.max_amount': ['Max salah.'],
      },
      IDS
    );

    expect(result).toEqual({
      'comp-a': { min_amount: 'Min salah.', max_amount: 'Max salah.' },
    });
  });

  it('keeps the first message when the backend sends several for one field', () => {
    const result = parsePayrollItemErrors(
      { 'items.0.default_amount': ['Pesan pertama.', 'Pesan kedua.'] },
      IDS
    );

    expect(result['comp-a'].default_amount).toBe('Pesan pertama.');
  });

  it('reads the camelCase keys the adjustment endpoint uses', () => {
    const result = parsePayrollItemErrors({ 'items.2.adjustedAmount': ['Tidak boleh.'] }, IDS);

    expect(result).toEqual({ 'comp-c': { adjustedAmount: 'Tidak boleh.' } });
  });

  it('ignores the top-level items error, which belongs to no row', () => {
    expect(parsePayrollItemErrors({ items: ['Minimal satu komponen.'] }, IDS)).toEqual({});
  });

  it('ignores an index the submitted payload never had', () => {
    expect(parsePayrollItemErrors({ 'items.9.default_amount': ['Entah.'] }, IDS)).toEqual({});
  });

  it('ignores keys that are not item errors at all', () => {
    expect(parsePayrollItemErrors({ employeeGradeId: ['Wajib diisi.'] }, IDS)).toEqual({});
  });

  it('ignores a malformed index', () => {
    expect(parsePayrollItemErrors({ 'items.x.default_amount': ['Entah.'] }, IDS)).toEqual({});
  });

  it('ignores an entry whose message list is empty', () => {
    expect(parsePayrollItemErrors({ 'items.0.default_amount': [] }, IDS)).toEqual({});
  });

  it('returns nothing when the request carried no field errors', () => {
    expect(parsePayrollItemErrors(undefined, IDS)).toEqual({});
  });
});

describe('hasPayrollRowErrors', () => {
  it('is true when an error points at a row', () => {
    expect(hasPayrollRowErrors({ 'items.0.default_amount': ['Salah.'] })).toBe(true);
  });

  it('is false for the form-wide items error, so it still reaches a toast', () => {
    expect(hasPayrollRowErrors({ items: ['Minimal satu komponen.'] })).toBe(false);
  });

  it('is false for an unrelated field', () => {
    expect(hasPayrollRowErrors({ employeeGradeId: ['Wajib.'] })).toBe(false);
  });

  it('is false when there are no field errors', () => {
    expect(hasPayrollRowErrors(undefined)).toBe(false);
  });
});
