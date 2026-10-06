import { describe, expect, it } from 'vitest';
import {
  flattenVisibleRows,
  getChartRange,
  getColumnLabel,
  getDayColumns,
  getHeaderGroups,
  getMonthColumns,
  getTimeColumns,
  getWeekColumns,
  groupDaysByMonth,
  groupDaysByWeek,
  isColumnToday,
  isColumnWeekend,
} from './gantt-utils';

describe('getChartRange', () => {
  it('returns a 3-month window from today when there are no bars', () => {
    const { start, end } = getChartRange([], 'day');
    const diffMonths =
      (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    expect(diffMonths).toBe(3);
  });
});

describe('getDayColumns', () => {
  it('returns one Date per day inclusive of start and end', () => {
    const days = getDayColumns(new Date('2026-06-01'), new Date('2026-06-03'));
    expect(days).toHaveLength(3);
  });
});

describe('getWeekColumns', () => {
  it('returns one Date per week (Monday), 2026-06-01 to 2026-06-14 → 2 weeks', () => {
    // 2026-06-01 is Monday; start of week = Jun 1. Next Monday = Jun 8. End = Jun 14 >= Jun 8, so 2 cols.
    const cols = getWeekColumns(new Date('2026-06-01'), new Date('2026-06-14'));
    expect(cols).toHaveLength(2);
    expect(cols[0].getDate()).toBe(1);
    expect(cols[1].getDate()).toBe(8);
  });
});

describe('getMonthColumns', () => {
  it('returns one Date per month, 2026-06-01 to 2026-08-31 → 3 months', () => {
    const cols = getMonthColumns(new Date('2026-06-01'), new Date('2026-08-31'));
    expect(cols).toHaveLength(3);
    expect(cols[0].getMonth()).toBe(5); // June
    expect(cols[2].getMonth()).toBe(7); // August
  });
});

describe('getTimeColumns', () => {
  it('dispatches to getDayColumns for day mode', () => {
    const a = getTimeColumns(new Date('2026-06-01'), new Date('2026-06-03'), 'day');
    const b = getDayColumns(new Date('2026-06-01'), new Date('2026-06-03'));
    expect(a).toHaveLength(b.length);
  });

  it('dispatches to getWeekColumns for week mode', () => {
    const a = getTimeColumns(new Date('2026-06-01'), new Date('2026-06-14'), 'week');
    const b = getWeekColumns(new Date('2026-06-01'), new Date('2026-06-14'));
    expect(a).toHaveLength(b.length);
  });

  it('dispatches to getMonthColumns for month mode', () => {
    const a = getTimeColumns(new Date('2026-06-01'), new Date('2026-08-31'), 'month');
    const b = getMonthColumns(new Date('2026-06-01'), new Date('2026-08-31'));
    expect(a).toHaveLength(b.length);
  });
});

describe('getHeaderGroups', () => {
  it('groups days by month label in day view', () => {
    const days = getDayColumns(new Date('2026-06-29'), new Date('2026-07-02'));
    const groups = getHeaderGroups(days, 'day');
    expect(groups.map((g) => g.label)).toEqual(['June 2026', 'July 2026']);
  });

  it('groups days by year label in month view', () => {
    const days = getDayColumns(new Date('2026-12-30'), new Date('2027-01-02'));
    const groups = getHeaderGroups(days, 'month');
    expect(groups.map((g) => g.label)).toEqual(['2026', '2027']);
  });

  it('groups week cols by month label in week view', () => {
    // weeks: Jun 1, Jun 8, Jun 15, Jun 22, Jun 29 (all June 2026)
    const cols = getWeekColumns(new Date('2026-06-01'), new Date('2026-06-30'));
    const groups = getHeaderGroups(cols, 'week');
    expect(groups[0].label).toBe('June 2026');
  });

  it('groups month cols by year in month view', () => {
    const cols = getMonthColumns(new Date('2026-11-01'), new Date('2027-02-28'));
    const groups = getHeaderGroups(cols, 'month');
    expect(groups.map((g) => g.label)).toEqual(['2026', '2027']);
  });
});

describe('getColumnLabel', () => {
  const d = new Date('2026-06-01'); // Monday, June 1
  it('day mode → day number', () => expect(getColumnLabel(d, 'day')).toBe('1'));
  it('week mode → W{N} (week of month)', () => expect(getColumnLabel(d, 'week')).toBe('Week 1'));
  it('month mode → MMM', () => expect(getColumnLabel(d, 'month')).toBe('June'));
});

describe('isColumnToday', () => {
  it('returns false for a past date in day mode', () => {
    expect(isColumnToday(new Date('2020-01-01'), 'day')).toBe(false);
  });
  it('returns true for today in day mode', () => {
    expect(isColumnToday(new Date(), 'day')).toBe(true);
  });
});

describe('isColumnWeekend', () => {
  const saturday = new Date('2026-06-06'); // Saturday
  it('day mode: Saturday is weekend', () => expect(isColumnWeekend(saturday, 'day')).toBe(true));
  it('week mode: always false', () => expect(isColumnWeekend(saturday, 'week')).toBe(false));
  it('month mode: always false', () => expect(isColumnWeekend(saturday, 'month')).toBe(false));
});

describe('groupDaysByWeek', () => {
  it('groups consecutive days into Monday-start week buckets', () => {
    // 2026-06-01 is a Monday, so Jun 1-7 is one full week and Jun 8 (the next Monday) starts a new bucket alone.
    const days = getDayColumns(new Date('2026-06-01'), new Date('2026-06-08'));
    const groups = groupDaysByWeek(days);
    expect(groups.map((g) => g.days.length)).toEqual([7, 1]);
  });
});

describe('groupDaysByMonth', () => {
  it('groups consecutive days into the same month bucket', () => {
    const days = getDayColumns(new Date('2026-06-29'), new Date('2026-07-02'));
    const groups = groupDaysByMonth(days);
    expect(groups.map((g) => g.days.length)).toEqual([2, 2]);
  });
});

describe('flattenVisibleRows', () => {
  interface Node {
    id: string;
    children?: Node[];
  }
  const tree: Node[] = [
    { id: 'a', children: [{ id: 'a1' }, { id: 'a2', children: [{ id: 'a2a' }] }] },
    { id: 'b' },
  ];
  const getSubRows = (n: Node) => n.children;
  const getRowId = (n: Node) => n.id;

  it('flattens a tree into a single array including parents and all descendants, with depth', () => {
    const rows = flattenVisibleRows(tree, getSubRows, getRowId, new Set());
    expect(rows.map((r) => [r.rowId, r.depth])).toEqual([
      ['a', 0],
      ['a1', 1],
      ['a2', 1],
      ['a2a', 2],
      ['b', 0],
    ]);
  });

  it('marks nodes with children as hasChildren', () => {
    const rows = flattenVisibleRows(tree, getSubRows, getRowId, new Set());
    const byId = new Map(rows.map((r) => [r.rowId, r.hasChildren]));
    expect(byId.get('a')).toBe(true);
    expect(byId.get('a1')).toBe(false);
    expect(byId.get('a2')).toBe(true);
    expect(byId.get('b')).toBe(false);
  });

  it('skips descendants of a collapsed node', () => {
    const rows = flattenVisibleRows(tree, getSubRows, getRowId, new Set(['a']));
    expect(rows.map((r) => r.rowId)).toEqual(['a', 'b']);
  });

  it('skips only the deeper descendants when an inner node is collapsed', () => {
    const rows = flattenVisibleRows(tree, getSubRows, getRowId, new Set(['a2']));
    expect(rows.map((r) => r.rowId)).toEqual(['a', 'a1', 'a2', 'b']);
  });
});
