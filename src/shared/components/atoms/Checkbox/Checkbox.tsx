import { forwardRef, useId } from 'react';
import { type CheckboxSize, Checkbox as UICheckbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

export interface CheckboxProps extends React.ComponentProps<typeof UICheckbox> {
  label?: string;
  description?: string;
  error?: string;
  size?: CheckboxSize;
}

export const Checkbox = forwardRef<HTMLButtonElement, CheckboxProps>(
  ({ className, size = 'md', label, description, error, disabled, checked, id, ...props }, ref) => {
    const generatedId = useId();
    const checkboxId = id || generatedId;

    return (
      <div className={cn('flex flex-col gap-2', disabled && 'opacity-50')}>
        <div className="flex items-center gap-3">
          <UICheckbox
            ref={ref}
            size={size}
            disabled={disabled}
            checked={checked}
            id={checkboxId}
            className={cn(
              disabled && 'pointer-events-none disabled:bg-input/50 disabled:border-input',
              error && 'border-destructive-500'
            )}
            {...props}
          />

          {label && (
            <label
              htmlFor={checkboxId}
              className={cn(
                'flex flex-col gap-1',
                disabled ? 'pointer-events-none cursor-not-allowed' : 'cursor-pointer'
              )}
            >
              <span className="text-sm font-medium text-slate-950">{label}</span>
              {description && <span className="text-xs text-slate-500">{description}</span>}
            </label>
          )}
        </div>

        {error && <p className="text-xs text-destructive-500">{error}</p>}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
