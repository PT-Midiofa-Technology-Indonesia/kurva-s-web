'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface SegmentedControlOption {
  value: string;
  label: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export interface SegmentedControlProps {
  options: SegmentedControlOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function SegmentedControl({ options, value, onChange, className }: SegmentedControlProps) {
  return (
    <div className={cn('flex flex-row items-center gap-1', className)}>
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              'flex flex-row justify-center items-center px-3 py-1.5 gap-1.5 h-8 rounded-lg',
              'text-sm font-medium text-slate-950 whitespace-nowrap transition-colors cursor-pointer',
              isActive ? 'bg-slate-100' : 'bg-white hover:bg-slate-50 active:bg-slate-100'
            )}
          >
            {option.leftIcon && (
              <span className="w-4 h-4 flex items-center justify-center shrink-0">
                {option.leftIcon}
              </span>
            )}
            {option.label}
            {option.rightIcon && (
              <span className="w-4 h-4 flex items-center justify-center shrink-0">
                {option.rightIcon}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
