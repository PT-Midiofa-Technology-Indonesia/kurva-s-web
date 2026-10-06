'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/atoms/Button';
import { cn } from '@/lib/utils';
import type { CalendarEvent, CalendarEventColor, CalendarProps } from './types';

const DEFAULT_DAY_NAMES = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

const COLOR_MAP: Record<string, string> = {
  blue: 'border-blue-200 bg-blue-50 text-blue-700',
  green: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  yellow: 'border-amber-200 bg-amber-50 text-amber-700',
  red: 'border-rose-200 bg-rose-50 text-rose-700',
  pink: 'border-pink-200 bg-pink-50 text-pink-700',
  purple: 'border-purple-200 bg-purple-50 text-purple-700',
  orange: 'border-orange-200 bg-orange-50 text-orange-700',
  teal: 'border-teal-200 bg-teal-50 text-teal-700',
  gray: 'border-slate-200 bg-slate-100 text-slate-700',
};

function toKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function addDays(d: Date, delta: number): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + delta);
}

function addMonths(d: Date, delta: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + delta, 1);
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function parseDate(val: Date | string): Date {
  if (val instanceof Date) return val;
  return new Date(val);
}

function eventColorClass(color?: CalendarEventColor): string {
  if (!color) return COLOR_MAP.gray;
  if (COLOR_MAP[color]) return COLOR_MAP[color];
  return '';
}

function eventInlineStyle(color?: CalendarEventColor): React.CSSProperties {
  if (!color || COLOR_MAP[color]) return {};
  return {
    backgroundColor: `${color}18`,
    color,
    borderColor: `${color}30`,
  };
}

export function Calendar({
  currentDate,
  events = [],
  maxVisible = 3,
  dayNames = DEFAULT_DAY_NAMES,
  headerMeta,
  headerActions,
  selectedDate,
  showOutsideDays = true,
  labels,
  onEventClick,
  onDateClick,
  onExpandMore,
  onMonthChange,
  onTodayClick,
}: CalendarProps) {
  const today = useMemo(() => new Date(), []);
  const [viewDate, setViewDate] = useState(() => startOfMonth(parseDate(currentDate ?? today)));

  useEffect(() => {
    if (!currentDate) return;
    setViewDate(startOfMonth(parseDate(currentDate)));
  }, [currentDate]);

  const selectedDateValue = selectedDate ?? null;
  const monthStart = startOfMonth(viewDate);
  const month = monthStart.getMonth();
  const firstDayOfWeek = monthStart.getDay();
  const daysInMonth = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0).getDate();

  const cells = useMemo(() => {
    const gridStart = addDays(monthStart, -firstDayOfWeek);
    const totalCells = Math.ceil((firstDayOfWeek + daysInMonth) / 7) * 7;

    return Array.from({ length: totalCells }, (_, index) => {
      const date = addDays(gridStart, index);
      const key = toKey(date);
      return {
        key,
        date,
        dateStr: key,
        day: date.getDate(),
        isToday: isSameDay(date, today),
        isCurrentMonth: date.getMonth() === month,
        isSelected: selectedDateValue === key,
      };
    });
  }, [daysInMonth, firstDayOfWeek, month, monthStart, selectedDateValue, today]);

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    for (const evt of events) {
      const key = evt.date;
      if (!map[key]) map[key] = [];
      map[key].push(evt);
    }
    return map;
  }, [events]);

  const monthLabel = viewDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  const goToMonth = (delta: number) => {
    const next = addMonths(viewDate, delta);
    setViewDate(next);
    onMonthChange?.(next);
  };

  const goToday = () => {
    const now = startOfMonth(today);
    setViewDate(now);
    onTodayClick?.();
    onMonthChange?.(now);
  };

  return (
    <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-5">
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          <Button variant="outline" size="sm" onClick={goToday} className="h-9 rounded-xl px-4">
            {labels?.today ?? 'Today'}
          </Button>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 rounded-xl p-0 text-slate-600"
              onClick={() => goToMonth(-1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 rounded-xl p-0 text-slate-600"
              onClick={() => goToMonth(1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <h2 className="text-lg font-semibold capitalize text-slate-950">{monthLabel}</h2>
          {headerMeta && <div className="flex flex-wrap items-center gap-2">{headerMeta}</div>}
        </div>
        {headerActions && <div className="flex flex-wrap items-center gap-2">{headerActions}</div>}
      </div>

      <div className="grid grid-cols-7 border-y border-slate-200 bg-white">
        {dayNames.map((name) => (
          <div key={name} className="px-2 py-3 text-center text-sm font-medium text-slate-500">
            {name}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 bg-white">
        {cells.map((cell, index) => {
          const dayEvents = eventsByDate[cell.dateStr] ?? [];
          const visible = dayEvents.slice(0, maxVisible);
          const hiddenCount = Math.max(dayEvents.length - maxVisible, 0);
          const showCell = showOutsideDays || cell.isCurrentMonth;
          const isLastColumn = (index + 1) % 7 === 0;
          const isLastRow = index >= cells.length - 7;

          return (
            // biome-ignore lint/a11y/noStaticElementInteractions: calendar cell needs full-cell click target without nesting interactive wrappers around event buttons
            <div
              data-testid="calendar-day-cell"
              key={cell.key}
              role={showCell && onDateClick ? 'button' : undefined}
              tabIndex={showCell && onDateClick ? 0 : undefined}
              className={cn(
                'flex min-h-[122px] flex-col gap-1.5 p-2 transition-colors',
                !isLastColumn && 'border-r border-slate-200',
                !isLastRow && 'border-b border-slate-200',
                showCell ? 'hover:bg-slate-50/70' : 'bg-slate-50/40',
                onDateClick && showCell && 'cursor-pointer'
              )}
              onClick={() => {
                if (!showCell) return;
                onDateClick?.(cell.dateStr);
              }}
              onKeyDown={(event) => {
                if (!showCell || !onDateClick) return;
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onDateClick(cell.dateStr);
                }
              }}
            >
              <div className="mb-0.5 flex items-center justify-start">
                {showCell ? (
                  <span
                    className={cn(
                      'inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium',
                      cell.isSelected || (!selectedDateValue && cell.isToday)
                        ? 'bg-teal-500 text-white'
                        : cell.isCurrentMonth
                          ? 'text-slate-700'
                          : 'text-slate-400'
                    )}
                  >
                    {cell.day}
                  </span>
                ) : null}
              </div>

              <div className="flex flex-col gap-1 overflow-hidden">
                {showCell &&
                  visible.map((evt) => (
                    <button
                      key={evt.id}
                      type="button"
                      className={cn(
                        'w-full truncate rounded-md border px-2 py-1 text-left text-[11px] font-medium leading-tight',
                        eventColorClass(evt.color)
                      )}
                      style={eventInlineStyle(evt.color)}
                      onClick={(event) => {
                        event.stopPropagation();
                        onEventClick?.(evt);
                      }}
                      title={evt.label}
                    >
                      <span className="block truncate">{evt.label}</span>
                    </button>
                  ))}
              </div>

              {showCell && hiddenCount > 0 && (
                <button
                  type="button"
                  className="mt-auto text-left text-xs font-medium text-slate-500 hover:text-slate-700"
                  onClick={(event) => {
                    event.stopPropagation();
                    onExpandMore?.(cell.dateStr, dayEvents);
                  }}
                >
                  {labels?.more?.(hiddenCount) ?? `+ ${hiddenCount} more`}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
