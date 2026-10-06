import { describe, expect, it } from 'vitest';
import { formatIDR } from './currency';

describe('formatIDR', () => {
  it('formats a positive number', () => {
    expect(formatIDR(15000)).toMatch(/Rp\s*15\.000/);
  });

  it('formats zero', () => {
    expect(formatIDR(0)).toMatch(/Rp\s*0/);
  });

  it('formats a negative number', () => {
    expect(formatIDR(-50000)).toMatch(/-Rp\s*50\.000/);
  });

  it('returns empty string for null', () => {
    expect(formatIDR(null)).toBe('');
  });

  it('returns empty string for undefined', () => {
    expect(formatIDR(undefined)).toBe('');
  });

  it('returns empty string for NaN', () => {
    expect(formatIDR(NaN)).toBe('');
  });
});
