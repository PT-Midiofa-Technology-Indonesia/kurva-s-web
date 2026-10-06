'use client';

import { AlertTriangle, CircleAlert, CircleCheck, CircleX, Loader2, X } from 'lucide-react';
import * as React from 'react';
import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialog as AlertDialogRoot,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type AlertDialogVariant = 'default' | 'danger' | 'success' | 'warning';

export interface ConfirmDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
  variant?: AlertDialogVariant;
  icon?: React.ReactNode;
  title: string;
  description?: string;
  cancelText?: string;
  confirmText?: string;
  onCancel?: () => void;
  onConfirm?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
  contentClassName?: string;
  footerClassName?: string;
}

const variantConfig: Record<AlertDialogVariant, { icon: React.ReactNode }> = {
  default: { icon: <CircleAlert className="size-4 text-slate-700" /> },
  danger: { icon: <CircleX className="size-4 text-red-500" /> },
  success: { icon: <CircleCheck className="size-4 text-green-500" /> },
  warning: { icon: <AlertTriangle className="size-4 text-amber-500" /> },
};

export const ConfirmDialog = ({
  open,
  onOpenChange,
  trigger,
  variant = 'default',
  icon,
  title,
  description,
  cancelText = 'Cancel',
  confirmText = 'Confirm',
  onCancel,
  onConfirm,
  isLoading = false,
  disabled = false,
  className,
  contentClassName,
  footerClassName,
}: ConfirmDialogProps) => {
  const config = variantConfig[variant];
  const displayIcon = icon ?? config.icon;

  const handleCancel = React.useCallback(() => {
    onCancel?.();
  }, [onCancel]);

  const handleConfirm = React.useCallback(() => {
    if (!isLoading && !disabled) {
      onConfirm?.();
    }
  }, [onConfirm, isLoading, disabled]);

  return (
    <AlertDialogRoot open={open} onOpenChange={onOpenChange}>
      {trigger && <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>}
      <AlertDialogContent
        className={cn(
          'max-w-[430px] rounded-[10px] border border-border bg-background p-6 shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] data-[size=default]:max-w-[430px] data-[size=sm]:max-w-[430px]',
          contentClassName
        )}
        size="default"
      >
        <div className="relative w-full">
          <div className="flex w-full flex-col items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-full border border-border">
              {displayIcon}
            </div>
            <AlertDialogTitle className="text-center text-[18px] font-semibold leading-7 text-slate-950">
              {title}
            </AlertDialogTitle>
            {description && (
              <AlertDialogDescription className="text-center text-[14px] leading-5 text-muted-foreground whitespace-pre-line">
                {description}
              </AlertDialogDescription>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 size-4 p-0 text-slate-950 hover:bg-transparent"
            onClick={handleCancel}
          >
            <X className="size-4" strokeWidth={1.5} />
          </Button>
        </div>
        <AlertDialogFooter
          className={cn(
            'mx-0 mb-0 mt-4 flex-row rounded-none border-t-0 bg-transparent p-0 pt-4',
            footerClassName
          )}
        >
          <AlertDialogCancel
            onClick={handleCancel}
            className={cn('h-9 flex-1 rounded-lg cursor-pointer', className)}
            variant={'outline'}
          >
            {isLoading ? <Loader2 className="size-4 animate-spin" /> : cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            variant={'default'}
            disabled={disabled || isLoading}
            className={cn('h-9 flex-1 rounded-lg cursor-pointer', className)}
          >
            {isLoading ? <Loader2 className="size-4 animate-spin" /> : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialogRoot>
  );
};

export {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogRoot as AlertDialogPrimitive,
  AlertDialogTitle,
  AlertDialogTrigger,
};
