'use client';

import { cva } from 'class-variance-authority';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export type AlertVariant = 'default' | 'destructive' | 'warning' | 'success';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
  showDismiss?: boolean;
  onDismiss?: () => void;
}

const alertVariants = cva('relative flex items-start gap-3 w-full rounded-[10px] border p-4', {
  variants: {
    variant: {
      default: 'bg-white border-slate-300 text-foreground',
      destructive: 'bg-white border-destructive-500 text-destructive-500',
      warning: 'bg-amber-50 border-amber-900 text-amber-900',
      success: 'bg-green-50 border-green-600 text-green-700',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

const variantIcon: Record<AlertVariant, React.ElementType> = {
  default: Info,
  destructive: AlertCircle,
  warning: Info,
  success: CheckCircle,
};

const iconColors: Record<AlertVariant, string> = {
  default: 'text-foreground',
  destructive: 'text-destructive-500',
  warning: 'text-amber-900',
  success: 'text-green-600',
};

const dismissButtonColors: Record<AlertVariant, string> = {
  default: 'text-slate-500 hover:bg-slate-100',
  destructive: 'text-destructive-500 hover:bg-destructive-50',
  warning: 'text-amber-900 hover:bg-amber-100',
  success: 'text-green-600 hover:bg-green-100',
};

export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = 'default', showDismiss, onDismiss, children, ...props }, ref) => {
    const Icon = variantIcon[variant];

    return (
      <div ref={ref} className={cn(alertVariants({ variant }), className)} role="alert" {...props}>
        <Icon className={cn('size-4 shrink-0 mt-0.5', iconColors[variant])} />
        <div className="flex-1">{children}</div>
        {showDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className={cn(
              'shrink-0 cursor-pointer hover:bg-slate-100 rounded p-0.5 transition-colors',
              dismissButtonColors[variant]
            )}
          >
            <X className="size-4" />
          </button>
        )}
      </div>
    );
  }
);

Alert.displayName = 'Alert';

export interface AlertTitleProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p';
}

export const AlertTitle = forwardRef<HTMLDivElement, AlertTitleProps>(
  ({ className, as: Component = 'p', ...props }, ref) => {
    return <Component ref={ref} className={cn('text-sm font-medium', className)} {...props} />;
  }
);

AlertTitle.displayName = 'AlertTitle';

export interface AlertDescriptionProps extends React.HTMLAttributes<HTMLDivElement> {}

export const AlertDescription = forwardRef<HTMLDivElement, AlertDescriptionProps>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} className={cn('text-sm text-slate-500 mt-1', className)} {...props} />;
  }
);

AlertDescription.displayName = 'AlertDescription';
