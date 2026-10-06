import { forwardRef, ReactNode } from 'react';
import { Input as ShadcnInput } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  prefix?: string;
  showLabel?: boolean;
  showHint?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      required = false,
      hint,
      error,
      leftIcon,
      rightIcon,
      prefix,
      showLabel = true,
      showHint = true,
      placeholder,
      disabled,
      className,
      ...props
    },
    ref
  ) => {
    const inputId = props.id || props.name;
    const hasError = !!error;
    const hasLeftContent = !!(leftIcon || prefix);

    return (
      <div className="w-full flex flex-col gap-2">
        {showLabel && label && (
          <Label
            htmlFor={inputId}
            className={required ? 'after:content-["*"] after:ml-0.5 after:text-brand-600' : ''}
          >
            {label}
          </Label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 flex items-center justify-center pointer-events-none text-muted-foreground">
              {leftIcon}
            </div>
          )}

          {prefix && !leftIcon && (
            <div className="absolute left-3 flex items-center justify-center pointer-events-none text-muted-foreground text-sm font-medium">
              {prefix}
            </div>
          )}

          <ShadcnInput
            ref={ref}
            id={inputId}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              hasLeftContent && (leftIcon ? 'pl-10' : 'pl-10'),
              rightIcon && 'pr-10',
              hasError && 'border-destructive focus-visible:ring-destructive',
              className
            )}
            aria-invalid={hasError}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3 flex items-center justify-center text-muted-foreground">
              {rightIcon}
            </div>
          )}
        </div>

        {showHint && (error || hint) && (
          <p className={cn('text-sm', hasError ? 'text-destructive' : 'text-muted-foreground')}>
            {error || hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
