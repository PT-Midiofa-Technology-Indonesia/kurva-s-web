import { ArrowUpRightFromSquare } from 'lucide-react';

import { cn } from '@/shared/lib/utils';

export interface DocumentLinkChipProps {
  href: string;
  label: string;
  className?: string;
}

export function DocumentLinkChip({ href, label, className }: DocumentLinkChipProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={cn(
        'inline-flex min-h-28 w-full items-center justify-between gap-4 rounded-4xl border border-slate-200 bg-white px-8 py-6 text-left shadow-sm transition-colors hover:bg-slate-50',
        className
      )}
    >
      <span className="truncate text-[40px] leading-none font-semibold text-slate-950">
        {label}
      </span>
      <ArrowUpRightFromSquare className="h-12 w-12 shrink-0 text-slate-500" />
    </a>
  );
}
