import { describe, expect, it } from 'vitest';
import { buildPayrollTabParams } from './build-payroll-tab-params';

describe('buildPayrollTabParams', () => {
  it('names the tab being opened', () => {
    expect(buildPayrollTabParams('', 'adjustment')).toBe('tab=adjustment');
  });

  it('leaves the default tab out of the url', () => {
    expect(buildPayrollTabParams('tab=draft', 'payroll-component')).toBe('');
  });

  it('drops the page the previous tab was on', () => {
    expect(buildPayrollTabParams('tab=salary-structure&page=3', 'adjustment')).toBe(
      'tab=adjustment'
    );
  });

  it('drops the previous tab search, which meant nothing here', () => {
    expect(buildPayrollTabParams('search=gaji', 'draft')).toBe('tab=draft');
  });

  it('drops a sort column the next tab does not have', () => {
    expect(buildPayrollTabParams('sortBy=description&sortOrder=desc', 'adjustment')).toBe(
      'tab=adjustment'
    );
  });

  it('keeps perPage, which is a preference rather than a position', () => {
    expect(buildPayrollTabParams('perPage=50&page=3', 'draft')).toBe('perPage=50&tab=draft');
  });

  it('keeps the filters that belong to a single tab', () => {
    const result = buildPayrollTabParams('category=pokok&gradeId=g1&status=draft', 'adjustment');

    const params = new URLSearchParams(result);
    expect(params.get('category')).toBe('pokok');
    expect(params.get('gradeId')).toBe('g1');
    expect(params.get('status')).toBe('draft');
  });

  it('returns an empty string when the default tab has nothing left to carry', () => {
    expect(buildPayrollTabParams('page=2&search=x', 'payroll-component')).toBe('');
  });

  it('replaces the tab already in the url rather than appending a second one', () => {
    const result = buildPayrollTabParams('tab=draft', 'salary-structure');

    expect(new URLSearchParams(result).getAll('tab')).toEqual(['salary-structure']);
  });
});
