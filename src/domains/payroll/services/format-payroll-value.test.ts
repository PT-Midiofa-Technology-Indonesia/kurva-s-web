import { describe, expect, it } from 'vitest';
import {
  formatPayrollValue,
  getPayrollValueBasis,
  validatePayrollValue,
} from './format-payroll-value';

describe('formatPayrollValue', () => {
  it('formats a fixed value as rupiah', () => {
    expect(formatPayrollValue(5000000, 'fixed')).toBe('Rp\u00a05.000.000');
  });

  it('formats a percentage value with a percent sign', () => {
    expect(formatPayrollValue(5, 'percentage')).toBe('5%');
  });

  it('keeps the decimals of a percentage value', () => {
    expect(formatPayrollValue(2.5, 'percentage')).toBe('2,5%');
  });

  it('drops a trailing zero decimal from a percentage value', () => {
    expect(formatPayrollValue(5.0, 'percentage')).toBe('5%');
  });

  it('accepts the string amounts the API sends for fixed components', () => {
    expect(formatPayrollValue('5000000', 'fixed')).toBe('Rp\u00a05.000.000');
  });

  it('returns a dash for a null value regardless of type', () => {
    expect(formatPayrollValue(null, 'fixed')).toBe('-');
    expect(formatPayrollValue(null, 'percentage')).toBe('-');
  });

  it('returns a dash for an unparseable value', () => {
    expect(formatPayrollValue('abc', 'percentage')).toBe('-');
  });

  it('formats zero rather than treating it as empty', () => {
    expect(formatPayrollValue(0, 'percentage')).toBe('0%');
    expect(formatPayrollValue(0, 'fixed')).toBe('Rp\u00a00');
  });
});

describe('getPayrollValueBasis', () => {
  it('describes a gross-based percentage', () => {
    expect(getPayrollValueBasis('percentage', 'gross', null)).toBe('dari Total Bruto');
  });

  it('describes a component-based percentage by the component name', () => {
    expect(getPayrollValueBasis('percentage', 'component', 'Gaji Pokok')).toBe('dari Gaji Pokok');
  });

  it('returns null for a fixed component', () => {
    expect(getPayrollValueBasis('fixed', null, null)).toBeNull();
  });

  it('returns null when a component base has no name to show', () => {
    expect(getPayrollValueBasis('percentage', 'component', null)).toBeNull();
  });
});

describe('validatePayrollValue', () => {
  it('accepts a percentage inside 0 to 100', () => {
    expect(validatePayrollValue(5, 'percentage')).toBeNull();
    expect(validatePayrollValue(0, 'percentage')).toBeNull();
    expect(validatePayrollValue(100, 'percentage')).toBeNull();
  });

  it('rejects a percentage above 100', () => {
    expect(validatePayrollValue(101, 'percentage')).toBe('Persentase harus antara 0 dan 100');
  });

  it('rejects a negative percentage', () => {
    expect(validatePayrollValue(-1, 'percentage')).toBe('Persentase harus antara 0 dan 100');
  });

  it('rejects a negative fixed amount', () => {
    expect(validatePayrollValue(-1, 'fixed')).toBe('Nominal tidak boleh negatif');
  });

  it('allows a fixed amount above 100', () => {
    expect(validatePayrollValue(5000000, 'fixed')).toBeNull();
  });

  it('treats an empty value as valid, since emptiness is checked elsewhere', () => {
    expect(validatePayrollValue(null, 'percentage')).toBeNull();
    expect(validatePayrollValue(null, 'fixed')).toBeNull();
  });
});
