'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface KanbanColumnProps {
  id: string;
  title: string;
  count?: number;
  children: React.ReactNode;
  header?: React.ReactNode;
  className?: string;
  itemIds: string[];
}

export const KanbanColumn = forwardRef<HTMLDivElement, KanbanColumnProps>(
  ({ className, id, title, count, children, header, itemIds, ...props }, ref) => {
    const { setNodeRef, isOver } = useDroppable({
      id: `column-${id}`,
    });

    return (
      <div
        ref={ref}
        className={cn(
          'flex w-66.5 shrink-0 flex-col gap-3 rounded-xl bg-slate-100 p-3',
          isOver && 'ring-2 ring-primary',
          className
        )}
        {...props}
      >
        <div className="flex h-8 items-center gap-3">
          <div className="flex flex-1 items-center gap-2">
            <span className="text-sm font-semibold text-slate-950">{title}</span>
            {count !== undefined && (
              <span className="flex items-center justify-center rounded-md border border-slate-300 bg-white px-1.5 py-0.5 text-xs font-medium text-slate-950">
                {count}
              </span>
            )}
          </div>
          {header}
        </div>

        <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
          <div ref={setNodeRef} className="flex flex-1 flex-col gap-3 overflow-y-auto">
            {children}
          </div>
        </SortableContext>
      </div>
    );
  }
);

KanbanColumn.displayName = 'KanbanColumn';
