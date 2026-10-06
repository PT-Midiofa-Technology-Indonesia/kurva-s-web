'use client';

import { CheckCircle2, Info, Loader2, TriangleAlert, X, XCircle } from 'lucide-react';
import type { ReactNode } from 'react';

import { Progress } from '@/shared/components/ui/progress';
import { cn } from '@/shared/lib/utils';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info' | 'loading' | 'progress';

export interface CustomToastProps {
  variant: ToastVariant;
  title: string;
  description?: string;
  percent?: number;
  onDismiss?: () => void;
}

const VARIANT_CONFIG: Record<
  ToastVariant,
  { borderColor: string; accentColor: string; iconColor: string; icon: ReactNode }
> = {
  success: {
    borderColor: 'border-green-500',
    accentColor: 'bg-green-50',
    iconColor: 'text-green-500',
    icon: <CheckCircle2 className="h-5 w-5" />,
  },
  error: {
    borderColor: 'border-red-500',
    accentColor: 'bg-red-50',
    iconColor: 'text-red-500',
    icon: <XCircle className="h-5 w-5" />,
  },
  warning: {
    borderColor: 'border-amber-500',
    accentColor: 'bg-amber-50',
    iconColor: 'text-amber-500',
    icon: <TriangleAlert className="h-5 w-5" />,
  },
  info: {
    borderColor: 'border-blue-500',
    accentColor: 'bg-blue-50',
    iconColor: 'text-blue-500',
    icon: <Info className="h-5 w-5" />,
  },
  loading: {
    borderColor: 'border-blue-500',
    accentColor: 'bg-blue-50',
    iconColor: 'text-blue-500',
    icon: <Loader2 className="h-5 w-5 animate-spin" />,
  },
  progress: {
    borderColor: 'border-slate-500',
    accentColor: 'bg-slate-50',
    iconColor: 'text-slate-500',
    icon: <Info className="h-5 w-5" />,
  },
};

export function CustomToast({ variant, title, description, percent, onDismiss }: CustomToastProps) {
  const { borderColor, accentColor, iconColor, icon } = VARIANT_CONFIG[variant];

  return (
    <div
      className={cn(
        'flex w-full overflow-hidden rounded-[10px] border min-w-sm',
        borderColor,
        accentColor
      )}
    >
      <div className="flex flex-1 items-start gap-3 px-4 py-3">
        <span className={cn('mt-0.5 shrink-0', iconColor)}>{icon}</span>
        <div className="flex min-w-0 flex-1 flex-col gap-1.5 h-full justify-center">
          <p className="text-sm font-medium leading-none">{title}</p>
          {variant === 'progress' ? (
            percent !== undefined ? (
              <div className="flex items-center gap-2">
                <Progress value={percent} className="h-1.5 flex-1" />
                <span className="text-xs tabular-nums text-muted-foreground">{percent}%</span>
              </div>
            ) : null
          ) : description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="shrink-0 text-muted-foreground hover:text-foreground"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
