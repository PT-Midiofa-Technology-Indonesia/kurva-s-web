'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Column } from '@tanstack/react-table';
import { ChevronDown, ChevronsUpDown, ChevronUp, GripVertical } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface DataTableColumnHeaderProps<TData, TValue> {
  column: Column<TData, TValue>;
  title: ReactNode;
  className?: string;
  rowDnd?: boolean;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
  rowDnd,
}: DataTableColumnHeaderProps<TData, TValue>) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: column.id,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
    position: 'relative',
  };

  const isSorted = column.getIsSorted();

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn('flex items-center gap-1 select-none', className)}
    >
      {rowDnd && (
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab touch-none text-muted-foreground hover:text-foreground active:cursor-grabbing"
          aria-label="Drag to reorder column"
        >
          <GripVertical className="h-3.5 w-3.5" />
        </button>
      )}

      {column.getCanSort() ? (
        <button
          type="button"
          className="flex items-center gap-1 hover:text-foreground text-foreground font-medium"
          onClick={() => column.toggleSorting(isSorted === 'asc')}
        >
          <span>{title}</span>
          {isSorted === 'asc' ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : isSorted === 'desc' ? (
            <ChevronDown className="h-3.5 w-3.5" />
          ) : (
            <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground" />
          )}
        </button>
      ) : (
        <span className="font-medium">{title}</span>
      )}
    </div>
  );
}
