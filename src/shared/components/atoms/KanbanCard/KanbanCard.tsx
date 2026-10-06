import { Paperclip } from 'lucide-react';
import { forwardRef, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface KanbanCardProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  dateRange?: string;
  company?: string;
  attachments?: { count: number; total: number };
  footer?: React.ReactNode;
}

export const KanbanCard = forwardRef<HTMLDivElement, KanbanCardProps>(
  ({ className, title, description, dateRange, company, attachments, footer, ...props }, ref) => {
    const hasTags = dateRange || company;
    const hasFooter = attachments || footer;

    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 transition-shadow hover:shadow-md',
          className
        )}
        {...props}
      >
        <div className="flex flex-col gap-1.5">
          <h3 className="text-sm font-medium leading-5 text-slate-950">{title}</h3>
          {description && (
            <p className="line-clamp-1 text-xs font-normal leading-4 text-slate-500">
              {description}
            </p>
          )}
        </div>

        {hasTags && (
          <div className="flex flex-col gap-2">
            {dateRange && (
              <span className="self-start rounded-md border border-slate-300 bg-white px-1.5 py-0.5 text-xs font-medium text-slate-950">
                {dateRange}
              </span>
            )}
            {company && (
              <span className="self-start rounded-md border border-slate-300 bg-white px-1.5 py-0.5 text-xs font-medium text-slate-950">
                {company}
              </span>
            )}
          </div>
        )}

        {hasFooter && (
          <>
            <div className="py-1">
              <div className="border-t border-slate-200" />
            </div>
            <div className="flex items-center gap-4">
              {attachments && (
                <div className="flex items-center gap-1.5">
                  <Paperclip size={14} className="text-slate-500" />
                  <span className="text-sm text-slate-500">
                    {attachments.count}/{attachments.total}
                  </span>
                </div>
              )}
              {footer}
            </div>
          </>
        )}
      </div>
    );
  }
);

KanbanCard.displayName = 'KanbanCard';
