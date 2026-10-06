'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/shared/components/ui/input';
import { Slider } from '@/shared/components/ui/slider';

export interface WeightSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  icon?: ReactNode;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  className?: string;
}

export function WeightSlider({
  label,
  value,
  onChange,
  icon,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  className,
}: WeightSliderProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 items-center gap-4 sm:grid-cols-[180px_1fr_100px]',
        disabled && 'opacity-60 pointer-events-none',
        className
      )}
    >
      <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-900">
        {icon && (
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
            {icon}
          </span>
        )}
        <span className="truncate">{label}</span>
      </div>

      <div className="flex items-center px-1">
        <Slider
          value={[value || 0]}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          onValueChange={([val]) => onChange(val)}
          className="w-full py-1"
        />
      </div>

      <div className="relative">
        <Input
          type="number"
          min={min}
          max={max}
          disabled={disabled}
          className="h-9 rounded-lg border-slate-200 pr-7 text-right font-medium text-slate-900 focus-visible:ring-cyan-600"
          value={value}
          onChange={(event) => {
            const nextVal = Number(event.target.value);
            onChange(Number.isNaN(nextVal) ? 0 : nextVal);
          }}
        />
        <span className="pointer-events-none absolute right-3 top-2 text-sm text-slate-400">%</span>
      </div>
    </div>
  );
}
