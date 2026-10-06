'use client';

import type { Locale } from 'date-fns';
import { addMonths, format, setMonth, setYear, subMonths } from 'date-fns';
import { id } from 'date-fns/locale';
import { CalendarIcon, ChevronDown, ChevronLeft, ChevronRight, XIcon } from 'lucide-react';
import * as React from 'react';
import type { DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';
import { Button } from '@/shared/components/atoms';
import { Calendar } from '@/shared/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';

export type DatePickerMode = 'single' | 'range' | 'month';

export interface DatePickerProps {
  mode?: DatePickerMode;
  value?: Date | DateRange | null;
  defaultValue?: Date | DateRange | null;
  onChange?: (value: Date | DateRange | undefined) => void;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean | ((date: Date) => boolean);
  placeholder?: string;
  rangePlaceholder?: string;
  className?: string;
  popoverClassName?: string;
  disabledState?: boolean;
  footer?: React.ReactNode;
  /** Open the popover immediately on mount. Useful for inline editors. */
  defaultOpen?: boolean;
  /** Date locale — defaults to Indonesian (id-ID). */
  locale?: Locale;
  /** Show the clear (x) button when a value is set. Default: true. */
  clearable?: boolean;
  /** Show a right-aligned chevron inside the trigger button. Default: false. */
  showChevron?: boolean;
  /** Portal container for the calendar popover. Pass the fullscreen element to keep it visible/interactive in fullscreen mode. */
  popoverContainer?: HTMLElement | null;
}

type CalView = 'days' | 'months' | 'years';

function getInitialMonth(value: Date | DateRange | null | undefined): Date {
  if (value instanceof Date) return value;
  if (value && typeof value === 'object' && 'from' in value && (value as DateRange).from) {
    return (value as DateRange).from!;
  }
  return new Date();
}

export const DatePicker = React.forwardRef<HTMLButtonElement, DatePickerProps>(
  (
    {
      mode = 'single',
      value,
      defaultValue,
      onChange,
      minDate,
      maxDate,
      disabled,
      placeholder = 'Pilih tanggal',
      rangePlaceholder = 'Pilih rentang tanggal',
      className,
      popoverClassName,
      disabledState = false,
      footer,
      defaultOpen = false,
      locale = id,
      clearable = true,
      showChevron = false,
      popoverContainer,
    },
    ref
  ) => {
    const [open, setOpen] = React.useState(defaultOpen);
    const [internalValue, setInternalValue] = React.useState<Date | DateRange | undefined>(() => {
      if (defaultValue === undefined || defaultValue === null) return undefined;
      if (mode === 'single') return defaultValue instanceof Date ? defaultValue : undefined;
      if ('from' in defaultValue) return defaultValue as DateRange;
      return undefined;
    });

    const [calView, setCalView] = React.useState<CalView>(() =>
      mode === 'month' ? 'months' : 'days'
    );
    const [currentMonth, setCurrentMonth] = React.useState<Date>(() =>
      getInitialMonth(value !== undefined ? value : defaultValue)
    );
    const [yearRangeStart, setYearRangeStart] = React.useState(() => {
      const y = currentMonth.getFullYear();
      return y - (y % 12);
    });

    // Derive localised short month names from date-fns locale.
    const monthNames = React.useMemo(
      () => Array.from({ length: 12 }, (_, i) => format(new Date(2000, i, 1), 'MMM', { locale })),
      [locale]
    );

    const isControlled = value !== undefined;
    const currentValue = isControlled ? (value ?? undefined) : internalValue;

    const handleOpenChange = (val: boolean) => {
      if (!disabledState) {
        setOpen(val);
        if (!val) setCalView(mode === 'month' ? 'months' : 'days');
      }
    };

    const handleSelect = React.useCallback(
      (selected: Date | DateRange | undefined) => {
        if (!isControlled) setInternalValue(selected);
        onChange?.(selected);
        if (mode === 'single') setOpen(false);
      },
      [isControlled, onChange, mode]
    );

    const handleClear = React.useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isControlled) setInternalValue(undefined);
        onChange?.(undefined);
      },
      [isControlled, onChange]
    );

    const disabledDates = React.useMemo(() => {
      const fns: ((date: Date) => boolean)[] = [];
      if (typeof disabled === 'function') fns.push(disabled);
      if (minDate) fns.push((d) => d < minDate);
      if (maxDate) fns.push((d) => d > maxDate);
      if (fns.length === 0) return undefined;
      return (d: Date) => fns.some((fn) => fn(d));
    }, [disabled, minDate, maxDate]);

    const displayText = React.useMemo(() => {
      if (!currentValue)
        return mode === 'single' || mode === 'month' ? placeholder : rangePlaceholder;
      if (mode === 'month' && currentValue instanceof Date) {
        return format(currentValue, 'MMM yyyy', { locale });
      }
      if (mode === 'single' && currentValue instanceof Date) {
        return format(currentValue, 'd MMMM yyyy', { locale });
      }
      if (mode === 'range' && currentValue && 'from' in currentValue) {
        const { from, to } = currentValue as DateRange;
        if (from && to) {
          return `${format(from, 'd MMM yyyy', { locale })} - ${format(to, 'd MMM yyyy', { locale })}`;
        }
        if (from) return `${format(from, 'd MMM yyyy', { locale })} - ...`;
      }
      return mode === 'single' ? placeholder : rangePlaceholder;
    }, [currentValue, mode, placeholder, rangePlaceholder, locale]);

    const isEmpty =
      !currentValue ||
      ((mode === 'single' || mode === 'month') && !(currentValue instanceof Date)) ||
      (mode === 'range' && 'from' in currentValue && !(currentValue as DateRange).from);

    // ── Navigation ──────────────────────────────────────────────────────
    const headerLabel = React.useMemo(() => {
      if (calView === 'years') return `${yearRangeStart} – ${yearRangeStart + 11}`;
      if (calView === 'months') return String(currentMonth.getFullYear());
      return format(currentMonth, 'MMMM yyyy', { locale });
    }, [calView, currentMonth, yearRangeStart, locale]);

    const handlePrev = () => {
      if (calView === 'days') setCurrentMonth((m) => subMonths(m, 1));
      else if (calView === 'months') setCurrentMonth((m) => subMonths(m, 12));
      else setYearRangeStart((y) => y - 12);
    };

    const handleNext = () => {
      if (calView === 'days') setCurrentMonth((m) => addMonths(m, 1));
      else if (calView === 'months') setCurrentMonth((m) => addMonths(m, 12));
      else setYearRangeStart((y) => y + 12);
    };

    const handleHeaderClick = () => {
      if (mode === 'month') {
        setCalView((v) => (v === 'months' ? 'years' : 'months'));
      } else {
        setCalView((v) => (v === 'days' ? 'years' : v === 'years' ? 'months' : 'days'));
      }
    };

    const handleSelectYear = (year: number) => {
      setCurrentMonth((m) => setYear(m, year));
      setCalView('months');
    };

    const handleSelectMonth = (monthIdx: number) => {
      const newMonth = setMonth(currentMonth, monthIdx);
      setCurrentMonth(newMonth);
      if (mode === 'month') {
        if (!isControlled) setInternalValue(newMonth);
        onChange?.(newMonth);
        setOpen(false);
      } else {
        setCalView('days');
      }
    };

    // ── Calendar body ───────────────────────────────────────────────────
    const calendarBody = () => {
      if (calView === 'years') {
        return (
          <div className="grid grid-cols-3 gap-2 p-2 w-63">
            {Array.from({ length: 12 }, (_, i) => yearRangeStart + i).map((year) => (
              <button
                key={year}
                type="button"
                onClick={() => handleSelectYear(year)}
                className={cn(
                  'flex h-12 items-center justify-center rounded-md text-sm font-normal transition-colors hover:bg-accent hover:text-accent-foreground',
                  year === currentMonth.getFullYear() &&
                    'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground'
                )}
              >
                {year}
              </button>
            ))}
          </div>
        );
      }

      if (calView === 'months' || mode === 'month') {
        return (
          <div className="grid grid-cols-3 gap-2 p-2 w-63">
            {monthNames.map((name, i) => (
              <button
                key={name}
                type="button"
                onClick={() => handleSelectMonth(i)}
                className={cn(
                  'flex h-12 items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
                  i === currentMonth.getMonth() &&
                    'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground'
                )}
              >
                {name}
              </button>
            ))}
          </div>
        );
      }

      // 'days' — hide the Calendar's own nav + caption; we render our own above.
      return (
        <Calendar
          mode="single"
          month={currentMonth}
          onMonthChange={setCurrentMonth}
          selected={currentValue as Date | undefined}
          onSelect={handleSelect as (date: Date | undefined) => void}
          disabled={disabledDates}
          footer={footer}
          locale={locale}
          hideNavigation
          classNames={{ month_caption: 'hidden' }}
        />
      );
    };

    return (
      <Popover open={open} onOpenChange={handleOpenChange}>
        <div className="relative w-auto">
          <PopoverTrigger asChild>
            <Button
              ref={ref}
              variant="outline"
              disabled={disabledState}
              className={cn(
                'relative h-8 w-full justify-start text-left font-normal',
                !isEmpty && (showChevron ? 'pr-16' : 'pr-8'),
                isEmpty && 'text-muted-foreground',
                disabledState && 'bg-input/50',
                className
              )}
            >
              <CalendarIcon className="mr-2 size-4" />
              <span className="truncate">{displayText}</span>
              {showChevron && (
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              )}
            </Button>
          </PopoverTrigger>
          {clearable && !isEmpty && (
            <button
              type="button"
              onClick={handleClear}
              className={cn(
                'absolute top-1/2 -translate-y-1/2 rounded-sm p-0.5 hover:bg-muted-foreground/20',
                showChevron ? 'right-8' : 'right-2'
              )}
              aria-label="Clear date"
            >
              <XIcon className="size-3.5 text-muted-foreground" />
            </button>
          )}
        </div>

        <PopoverContent container={popoverContainer} className={cn('w-auto p-0', popoverClassName)}>
          {mode === 'single' || mode === 'month' ? (
            <div className="p-3">
              <div className="flex items-center justify-between mb-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  className="h-7 w-7"
                  onClick={handlePrev}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <button
                  type="button"
                  onClick={handleHeaderClick}
                  className="flex items-center gap-1 rounded-md px-2 py-1 text-sm font-semibold transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  {headerLabel}
                  <ChevronDown className="h-3 w-3 text-muted-foreground" />
                </button>

                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  className="h-7 w-7"
                  onClick={handleNext}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {calendarBody()}
            </div>
          ) : (
            <Calendar
              mode="range"
              selected={currentValue as DateRange | undefined}
              onSelect={handleSelect as (range: DateRange | undefined) => void}
              numberOfMonths={2}
              disabled={disabledDates}
              footer={footer}
              locale={locale}
              captionLayout="dropdown"
            />
          )}
        </PopoverContent>
      </Popover>
    );
  }
);

DatePicker.displayName = 'DatePicker';
