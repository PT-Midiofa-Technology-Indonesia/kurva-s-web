'use client';

import type { ReactNode } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/components/ui/tooltip';

export interface NoticeTooltipProps {
  children: ReactNode;
  title: string;
  description: ReactNode;
}

export function NoticeTooltip({ children, title, description }: NoticeTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent
          align="start"
          arrowClassName="!bg-white !fill-white"
          className="flex w-[328px] flex-col items-start rounded-lg bg-white p-6 text-left text-slate-500 shadow-[0_12px_16px_-4px_rgba(16,24,40,0.08),0_4px_6px_-2px_rgba(16,24,40,0.03)]"
          side="top"
          sideOffset={8}
        >
          <p className="text-base font-semibold text-slate-700">{title}</p>
          <p className="mt-2 text-sm leading-6">{description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
