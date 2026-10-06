'use client';

import { ChevronDown, ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui';
import { cn } from '@/lib/utils';

export interface CollapsibleFormCardProps {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
  className?: string;
}

export function CollapsibleFormCard({
  title,
  defaultOpen = true,
  children,
  className,
}: CollapsibleFormCardProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className={cn(
        'rounded-[14px] border border-slate-200 bg-white shadow-sm overflow-hidden',
        className
      )}
    >
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className="w-full px-6 py-4 flex items-center justify-between border-b border-slate-200 hover:bg-slate-50 transition-colors"
        >
          <h3 className="text-base font-semibold text-slate-950">{title}</h3>
          {open ? (
            <ChevronDown className="h-4 w-4 text-slate-500" />
          ) : (
            <ChevronRight className="h-4 w-4 text-slate-500" />
          )}
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>{children}</CollapsibleContent>
    </Collapsible>
  );
}
