'use client';

import { UseSortableArguments, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface KanbanItemProps extends Pick<UseSortableArguments, 'disabled'> {
  id: string;
  children: React.ReactNode;
  className?: string;
  onCardClick?: () => void;
}

export const KanbanItem = forwardRef<HTMLButtonElement, KanbanItemProps>(
  ({ className, id, children, disabled, onCardClick }, ref) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
      id,
      disabled,
    });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    return (
      <button
        type="button"
        ref={(node) => {
          setNodeRef(node);
          if (ref) {
            if (typeof ref === 'function') ref(node);
            else (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node;
          }
        }}
        style={style}
        className={cn(
          'w-full text-left cursor-grab active:cursor-grabbing touch-none',
          isDragging && 'opacity-30',
          className
        )}
        onClick={onCardClick}
        {...attributes}
        {...listeners}
      >
        {children}
      </button>
    );
  }
);

KanbanItem.displayName = 'KanbanItem';
