import {
  addDays,
  addMonths,
  addWeeks,
  endOfMonth,
  format,
  isSameMonth,
  isThisWeek,
  isToday,
  isWeekend,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from 'date-fns';

export type GanttViewMode = 'day' | 'week' | 'month';

export function getChartRange(
  bars: { start: Date; end: Date }[],
  viewMode: GanttViewMode
): { start: Date; end: Date } {
  if (bars.length === 0) {
    const today = new Date();
    return { start: startOfMonth(today), end: addMonths(startOfMonth(today), 3) };
  }
  const allDates = bars.flatMap((b) => [b.start, b.end]);
  const minDate = new Date(Math.min(...allDates.map((d) => d.getTime())));
  const maxDate = new Date(Math.max(...allDates.map((d) => d.getTime())));

  if (viewMode === 'month') {
    return { start: startOfMonth(minDate), end: endOfMonth(maxDate) };
  }
  if (viewMode === 'week') {
    return {
      start: startOfMonth(minDate),
      end: endOfMonth(maxDate),
    };
  }
  const rangeStart = addDays(minDate, -3);
  const rangeEnd = addDays(maxDate, 3);
  // Minimum 30 columns for day view
  const minEnd = addDays(rangeStart, 29);
  return { start: rangeStart, end: rangeEnd > minEnd ? rangeEnd : minEnd };
}

export function getDayColumns(start: Date, end: Date): Date[] {
  const cols: Date[] = [];
  let cur = startOfDay(start);
  const endDay = startOfDay(end);
  while (cur <= endDay) {
    cols.push(cur);
    cur = addDays(cur, 1);
  }
  return cols;
}

export function getWeekColumns(start: Date, end: Date): Date[] {
  const cols: Date[] = [];
  let cur = startOfWeek(start, { weekStartsOn: 1 });
  const endDay = startOfDay(end);
  while (cur <= endDay) {
    cols.push(cur);
    cur = addWeeks(cur, 1);
  }
  return cols;
}

export function getMonthColumns(start: Date, end: Date): Date[] {
  const cols: Date[] = [];
  let cur = startOfMonth(start);
  const endDay = startOfDay(end);
  while (cur <= endDay) {
    cols.push(cur);
    cur = addMonths(cur, 1);
  }
  return cols;
}

export function getTimeColumns(start: Date, end: Date, viewMode: GanttViewMode): Date[] {
  if (viewMode === 'week') return getWeekColumns(start, end);
  if (viewMode === 'month') return getMonthColumns(start, end);
  return getDayColumns(start, end);
}

export interface HeaderGroup {
  label: string;
  span: number;
}

export function getHeaderGroups(cols: Date[], viewMode: GanttViewMode): HeaderGroup[] {
  const labelFormat = viewMode === 'month' ? 'yyyy' : 'MMMM yyyy';
  const groups: HeaderGroup[] = [];
  let cur: string | null = null;
  let span = 0;
  for (const d of cols) {
    const label = format(d, labelFormat);
    if (label !== cur) {
      if (cur !== null) groups.push({ label: cur, span });
      cur = label;
      span = 1;
    } else {
      span++;
    }
  }
  if (cur) groups.push({ label: cur, span });
  return groups;
}

export function getWeekOfMonth(date: Date): number {
  const monthStart = startOfMonth(date);
  const weekOfMonthStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const weekOfDate = startOfWeek(date, { weekStartsOn: 1 });
  return (
    Math.round((weekOfDate.getTime() - weekOfMonthStart.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1
  );
}

export function getColumnLabel(col: Date, viewMode: GanttViewMode): string {
  if (viewMode === 'week') return `Week ${getWeekOfMonth(col)}`;
  if (viewMode === 'month') return format(col, 'MMMM');
  return format(col, 'd');
}

export function isColumnToday(col: Date, viewMode: GanttViewMode): boolean {
  if (viewMode === 'week') return isThisWeek(col, { weekStartsOn: 1 });
  if (viewMode === 'month') return isSameMonth(col, new Date());
  return isToday(col);
}

export function isColumnWeekend(col: Date, viewMode: GanttViewMode): boolean {
  if (viewMode === 'day') return isWeekend(col);
  return false;
}

export function groupDaysByWeek(days: Date[]): { weekStart: Date; days: Date[] }[] {
  const groups: { weekStart: Date; days: Date[] }[] = [];
  for (const d of days) {
    const ws = startOfWeek(d, { weekStartsOn: 1 });
    const last = groups[groups.length - 1];
    if (last && last.weekStart.getTime() === ws.getTime()) {
      last.days.push(d);
    } else {
      groups.push({ weekStart: ws, days: [d] });
    }
  }
  return groups;
}

export function groupDaysByMonth(days: Date[]): { monthStart: Date; days: Date[] }[] {
  const groups: { monthStart: Date; days: Date[] }[] = [];
  for (const d of days) {
    const ms = startOfMonth(d);
    const last = groups[groups.length - 1];
    if (last && last.monthStart.getTime() === ms.getTime()) {
      last.days.push(d);
    } else {
      groups.push({ monthStart: ms, days: [d] });
    }
  }
  return groups;
}

export interface FlatGanttRow<TData> {
  row: TData;
  rowId: string;
  depth: number;
  hasChildren: boolean;
}

/** Flattens a tree into a single ordered list, skipping the descendants of any rowId in `collapsed`. */
export function flattenVisibleRows<TData>(
  rows: TData[],
  getSubRows: ((row: TData) => TData[] | undefined) | undefined,
  getRowId: (row: TData) => string,
  collapsed: Set<string>,
  depth = 0
): FlatGanttRow<TData>[] {
  const out: FlatGanttRow<TData>[] = [];
  for (const row of rows) {
    const rowId = getRowId(row);
    const children = getSubRows?.(row);
    const hasChildren = !!children && children.length > 0;
    out.push({ row, rowId, depth, hasChildren });
    if (hasChildren && !collapsed.has(rowId)) {
      out.push(...flattenVisibleRows(children, getSubRows, getRowId, collapsed, depth + 1));
    }
  }
  return out;
}
