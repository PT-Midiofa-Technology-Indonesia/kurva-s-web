import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface FormCardProps {
  children: ReactNode;
  className?: string;
}

export function FormCard({ children, className }: FormCardProps) {
  return (
    <div className={cn('bg-white border border-slate-200 rounded-[14px] shadow-sm', className)}>
      <div className="px-6 py-6">{children}</div>
    </div>
  );
}
