'use client';

import { Check, Minus } from 'lucide-react';
import { Checkbox as CheckboxPrimitive } from 'radix-ui';
import * as React from 'react';
import { cn } from '@/lib/utils';

export type CheckboxSize = 'sm' | 'md' | 'lg';

export interface CheckboxProps
  extends Omit<React.ComponentProps<typeof CheckboxPrimitive.Root>, 'size'> {
  size?: CheckboxSize;
}

const sizeClasses: Record<CheckboxSize, string> = {
  sm: 'size-4',
  md: 'size-5',
  lg: 'size-6',
};

const iconSizeClasses: Record<CheckboxSize, string> = {
  sm: 'size-3',
  md: 'size-4',
  lg: 'size-[20px]',
};

function Checkbox({ className, size = 'md', checked, ...props }: CheckboxProps) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      checked={checked === 'indeterminate' ? false : checked}
      className={cn(
        'cursor-pointer peer relative flex shrink-0 items-center justify-center rounded-[4px] border transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        sizeClasses[size],
        // Unchecked state
        'bg-white border-slate-300',
        // Checked state
        'data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:text-white',
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className={cn(
          'grid place-content-center text-white transition-none',
          iconSizeClasses[size]
        )}
      >
        {checked === 'indeterminate' ? (
          <Minus className="h-full w-full" strokeWidth={3} />
        ) : (
          <Check className="h-full w-full" strokeWidth={3} />
        )}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
