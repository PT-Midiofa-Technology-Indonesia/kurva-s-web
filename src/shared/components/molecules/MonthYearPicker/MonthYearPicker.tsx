'use client';

import { format, setMonth, setYear, startOfMonth } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export interface MonthYearPickerProps {
  value?: Date;
  onChange: (date: Date) => void;
  fromYear?: number;
  toYear?: number;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  error?: boolean;
}

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

export function MonthYearPicker({
  value,
  onChange,
  fromYear,
  toYear,
  placeholder = 'Pick month',
  className,
  disabled = false,
  error = false,
}: MonthYearPickerProps) {
  const [open, setOpen] = React.useState(false);
  const currentYear = new Date().getFullYear();
  const defaultFromYear = fromYear ?? currentYear - 3;
  const defaultToYear = toYear ?? currentYear;

  const [selectedYear, setSelectedYear] = React.useState(value ? value.getFullYear() : currentYear);

  React.useEffect(() => {
    if (value) {
      setSelectedYear(value.getFullYear());
    }
  }, [value]);

  const years = React.useMemo(() => {
    const yearList = [];
    for (let year = defaultToYear; year >= defaultFromYear; year--) {
      yearList.push(year);
    }
    return yearList;
  }, [defaultFromYear, defaultToYear]);

  const handleMonthClick = (monthIndex: number) => {
    const newDate = startOfMonth(setMonth(setYear(new Date(), selectedYear), monthIndex));
    onChange(newDate);
    setOpen(false);
  };

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal',
            !value && 'text-muted-foreground',
            error && 'border-destructive ring-3 ring-destructive/20',
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, 'MMM yyyy') : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3" align="start">
        <div className="space-y-3">
          {/* Year Selector */}
          <div className="flex items-center justify-center gap-2">
            <select
              value={selectedYear}
              onChange={(e) => handleYearChange(Number(e.target.value))}
              className="flex h-8 rounded-md border border-input bg-background px-3 py-1 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* Month Grid */}
          <div className="grid grid-cols-3 gap-2">
            {MONTHS.map((month, index) => {
              const isSelected =
                value && value.getMonth() === index && value.getFullYear() === selectedYear;
              const isCurrentMonth =
                new Date().getMonth() === index && new Date().getFullYear() === selectedYear;

              return (
                <button
                  key={month}
                  type="button"
                  onClick={() => handleMonthClick(index)}
                  className={cn(
                    'h-9 rounded-md px-3 text-sm font-normal transition-colors',
                    'hover:bg-muted hover:text-foreground',
                    'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                    isSelected &&
                      'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground',
                    isCurrentMonth &&
                      !isSelected &&
                      'border border-primary text-primary font-medium hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  {month.slice(0, 3)}
                </button>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
