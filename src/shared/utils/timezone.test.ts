import { describe, expect, it } from 'vitest';
import { formatTimezone } from './timezone';

describe('formatTimezone', () => {
  it('labels the three Indonesian zones', () => {
    expect(formatTimezone('Asia/Jakarta')).toBe('WIB (Asia/Jakarta)');
    expect(formatTimezone('Asia/Makassar')).toBe('WITA (Asia/Makassar)');
    expect(formatTimezone('Asia/Jayapura')).toBe('WIT (Asia/Jayapura)');
  });

  it('falls back to the raw name for a zone it does not label', () => {
    expect(formatTimezone('Asia/Singapore')).toBe('Asia/Singapore');
  });

  it('returns null when there is no zone to show', () => {
    expect(formatTimezone(null)).toBeNull();
    expect(formatTimezone(undefined)).toBeNull();
    expect(formatTimezone('')).toBeNull();
  });
});
